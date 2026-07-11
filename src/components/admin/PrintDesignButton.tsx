"use client";

interface PrintDesignButtonProps {
  frontDesignUrl?: string | null;
  backDesignUrl?: string | null;
  label?: string;
}

export function PrintDesignButton({ frontDesignUrl, backDesignUrl, label = "Print Design" }: PrintDesignButtonProps) {
  if (!frontDesignUrl && !backDesignUrl) return null;

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) return;
    const htmlContent = `
      <html>
        <head>
          <title>Print Design</title>
          <style>
            body { margin: 0; padding: 24px; font-family: sans-serif; }
            .sheet { page-break-after: always; text-align: center; padding: 24px 0; }
            .sheet:last-child { page-break-after: auto; }
            img { max-width: 100%; max-height: 85vh; object-fit: contain; }
            p { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          ${frontDesignUrl ? `<div class="sheet"><p>Front</p><img src="${frontDesignUrl}" /></div>` : ""}
          ${backDesignUrl ? `<div class="sheet"><p>Back</p><img src="${backDesignUrl}" /></div>` : ""}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    win.document.open();
    win.document.write(htmlContent);
    win.document.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="text-xs px-3 py-1.5 border border-[#111111] text-[#111111] rounded hover:bg-[#111111] hover:text-white transition-colors"
    >
      🖨 {label}
    </button>
  );
}