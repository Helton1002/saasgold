export default {
  secret: process.env.JWT_SECRET || "kZaOTd+YZpjRUyyuQUpigJaEMk4vcW4YOymKPZX0Ts8",
  expiresIn: "15m",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "dBSXqFg9TaNUEDXVp6fhMTRLBysP+j2DSqf7+raxD3A",
  refreshExpiresIn: "7d"
};