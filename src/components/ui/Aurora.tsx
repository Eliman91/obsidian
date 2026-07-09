/* =============================================================
   AURORA — nappes de lumière ambiantes (décor du hero).
   Purement décoratif (aria-hidden). Aucune interactivité, aucun
   JS : les nappes dérivent en CSS (coupées si reduced-motion).
   À placer en premier enfant d'un conteneur `relative isolate`.
   ============================================================= */
export function Aurora() {
  return (
    <div className="aurora" aria-hidden="true">
      <span className="aurora__blob aurora__blob--cyan" />
      <span className="aurora__blob aurora__blob--plasma" />
      <span className="aurora__blob aurora__blob--accent" />
    </div>
  );
}
