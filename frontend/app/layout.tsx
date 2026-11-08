import type { Metadata } from "next";
import "./tailwind.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { GlobalHeader } from "@/components/GlobalHeader";

export const metadata: Metadata = {
  title: "DriveX Automotive | Car Rental & Sales Cambodia",
  description: "Next-generation vehicle e-commerce platform offering Electric Vehicles (EV), Gasoline Cars, SUVs, Trucks, E-Bikes, Spare Parts with Multi-Branch Showrooms, Installment Loans, and Trade-in Valuations.",
  keywords: ["DriveX Cambodia", "Toyota Cambodia", "Electric Vehicles", "Cambodia Cars", "Vehicle Installment", "Trade-in", "EV Showroom", "Multi-Branch Inventory", "Phnom Penh Cars"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var origError = console.error;
                  console.error = function() {
                    for (var i = 0; i < arguments.length; i++) {
                      var str = String(arguments[i]);
                      if (str.indexOf('bis_skin_checked') !== -1 || (str.indexOf('hydrated') !== -1 && str.indexOf('attributes') !== -1)) {
                        return;
                      }
                    }
                    origError.apply(console, arguments);
                  };
                  window.addEventListener('error', function(event) {
                    if (event && event.message && (event.message.indexOf('bis_skin_checked') !== -1 || (event.message.indexOf('hydrat') !== -1 && event.message.indexOf('attribute') !== -1))) {
                      event.stopImmediatePropagation();
                      event.preventDefault();
                    }
                  }, true);
                  if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                      for (var i = 0; i < mutations.length; i++) {
                        var m = mutations[i];
                        if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked' && m.target && m.target.removeAttribute) {
                          m.target.removeAttribute('bis_skin_checked');
                        }
                      }
                    });
                    observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['bis_skin_checked'] });
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-amber-400 selection:text-slate-950" suppressHydrationWarning>
        <Providers>
          <GlobalHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
