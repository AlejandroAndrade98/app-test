export default function Document() {
  return (
    <html lang="es">
      <head>
        {/* Fuerza fondo y altura completa en html/body/#root */}
        <style>{`
          html, body, #root { height: 100%; background: #0B1220; }
          /* RNW a veces mete un wrapper extra; cúbrelo también */
          #root > div { min-height: 100%; background: #0B1220; }
        `}</style>
      </head>
      <body>
        <div id="root" />
      </body>
    </html>
  );
}