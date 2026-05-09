import React from "react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_sao-joao-lampas/artifacts/31zt6imn_minilogo-transparente.png";

export default function SRDFSJLLogo({ className = "", size = 48 }) {
  return (
    <img
      src={LOGO_URL}
      alt="SRDFSJL Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export { LOGO_URL };
