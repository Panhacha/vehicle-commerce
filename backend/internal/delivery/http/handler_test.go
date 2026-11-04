package http

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"vehicle-commerce/backend/internal/config"
	"vehicle-commerce/backend/internal/domain"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func TestAdminAuthorization(t *testing.T) {
	gin.SetMode(gin.TestMode)
	h := NewHandler(nil, &config.Config{JWTSecret: "test-secret"})
	router := gin.New()
	router.GET("/admin", h.AuthMiddleware(), h.RequireRoles("SUPER_ADMIN", "BRANCH_ADMIN"), func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	tests := []struct {
		name       string
		role       string
		branchID   string
		query      string
		demoHeader string
		wantStatus int
	}{
		{name: "demo role header is rejected", demoHeader: "SUPER_ADMIN", wantStatus: http.StatusUnauthorized},
		{name: "customer token is rejected", role: "CUSTOMER", branchID: "branch-1", wantStatus: http.StatusForbidden},
		{name: "staff cannot access manager endpoint", role: "STAFF", branchID: "branch-1", wantStatus: http.StatusForbidden},
		{name: "branch manager is authorized for own branch", role: "BRANCH_ADMIN", branchID: "branch-1", wantStatus: http.StatusNoContent},
		{name: "super admin is authorized without branch assignment", role: "SUPER_ADMIN", wantStatus: http.StatusNoContent},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodGet, "/admin"+tt.query, nil)
			if tt.demoHeader != "" {
				request.Header.Set("X-Demo-Role", tt.demoHeader)
			}
			if tt.role != "" {
				request.Header.Set("Authorization", "Bearer "+makeTestToken(t, tt.role, tt.branchID))
			}
			response := httptest.NewRecorder()
			router.ServeHTTP(response, request)
			if response.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d; body: %s", response.Code, tt.wantStatus, response.Body.String())
			}
		})
	}
}

func TestAdminMeRouteIsRegistered(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := NewHandler(nil, &config.Config{}).InitRouter()
	request := httptest.NewRequest(http.MethodGet, "/api/v1/admin/me", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d; body: %s", response.Code, http.StatusUnauthorized, response.Body.String())
	}
}

func TestApplyAdminIdentityScopesBranchAndRejectsDisabledUsers(t *testing.T) {
	gin.SetMode(gin.TestMode)
	branchID := "branch-1"

	tests := []struct {
		name       string
		user       *domain.User
		query      string
		wantStatus int
		wantBranch string
	}{
		{
			name:  "manager cannot request another branch",
			user:  &domain.User{ID: "user-1", BranchID: &branchID, Role: domain.RoleBranchAdmin, Status: "ACTIVE"},
			query: "?branch_id=branch-2", wantStatus: http.StatusForbidden,
		},
		{
			name:       "manager is scoped to assigned branch",
			user:       &domain.User{ID: "user-1", BranchID: &branchID, Role: domain.RoleBranchAdmin, Status: "ACTIVE"},
			wantStatus: http.StatusNoContent, wantBranch: branchID,
		},
		{
			name:       "disabled user is rejected",
			user:       &domain.User{ID: "user-1", BranchID: &branchID, Role: domain.RoleBranchAdmin, Status: "DISABLED"},
			wantStatus: http.StatusForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(recorder)
			ctx.Request = httptest.NewRequest(http.MethodGet, "/admin"+tt.query, nil)
			if applyAdminIdentity(ctx, tt.user) {
				ctx.Status(http.StatusNoContent)
				ctx.Writer.WriteHeaderNow()
			}
			if recorder.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d", recorder.Code, tt.wantStatus)
			}
			if got := ctx.GetString("branch_id"); got != tt.wantBranch {
				t.Fatalf("branch scope = %q, want %q", got, tt.wantBranch)
			}
		})
	}
}

func makeTestToken(t *testing.T, role, branchID string) string {
	t.Helper()
	claims := jwt.MapClaims{
		"sub":  "user-1",
		"role": role,
		"exp":  time.Now().Add(time.Hour).Unix(),
	}
	if branchID != "" {
		claims["branch_id"] = branchID
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	value, err := token.SignedString([]byte("test-secret"))
	if err != nil {
		t.Fatal(err)
	}
	return value
}
