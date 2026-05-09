import React from "react";

export default function SRDFSILLogo({ className = "", size = 48 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield shape */}
      <path
        d="M100 10 L180 45 L180 110 Q180 170 100 195 Q20 170 20 110 L20 45 Z"
        fill="#0d6b4f"
        stroke="#0a5640"
        strokeWidth="3"
      />
      {/* Inner shield */}
      <path
        d="M100 22 L170 52 L170 108 Q170 162 100 185 Q30 162 30 108 L30 52 Z"
        fill="#FFFFFF"
        stroke="#0d6b4f"
        strokeWidth="1.5"
      />
      {/* Green inner accent */}
      <path
        d="M100 34 L158 60 L158 106 Q158 152 100 173 Q42 152 42 106 L42 60 Z"
        fill="#0d6b4f"
        opacity="0.08"
      />
      {/* SRDFSIL text */}
      <text
        x="100"
        y="60"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', serif"
        fontWeight="700"
        fontSize="22"
        fill="#0d6b4f"
        letterSpacing="2"
      >
        SRDFSIL
      </text>
      {/* Horizontal line */}
      <line x1="55" y1="70" x2="145" y2="70" stroke="#0d6b4f" strokeWidth="1" opacity="0.4" />
      {/* Laurel left */}
      <path
        d="M60 100 Q55 85 65 78 Q58 90 65 100 Q58 92 55 105 Q52 95 60 100Z"
        fill="#0d6b4f"
        opacity="0.6"
      />
      <path
        d="M55 115 Q50 100 60 93 Q53 105 60 115 Q53 107 50 120 Q47 110 55 115Z"
        fill="#0d6b4f"
        opacity="0.5"
      />
      {/* Laurel right */}
      <path
        d="M140 100 Q145 85 135 78 Q142 90 135 100 Q142 92 145 105 Q148 95 140 100Z"
        fill="#0d6b4f"
        opacity="0.6"
      />
      <path
        d="M145 115 Q150 100 140 93 Q147 105 140 115 Q147 107 150 120 Q153 110 145 115Z"
        fill="#0d6b4f"
        opacity="0.5"
      />
      {/* Sports icons - Football */}
      <circle cx="85" cy="105" r="12" fill="none" stroke="#0d6b4f" strokeWidth="1.5" />
      <path d="M85 93 L85 117 M73 105 L97 105 M76 96 L94 114 M94 96 L76 114" stroke="#0d6b4f" strokeWidth="0.5" opacity="0.3" />
      {/* Theater masks */}
      <g transform="translate(115, 93)">
        <ellipse cx="0" cy="8" rx="8" ry="10" fill="none" stroke="#0d6b4f" strokeWidth="1.5" />
        <path d="M-4 6 Q0 10 4 6" stroke="#0d6b4f" strokeWidth="1" fill="none" />
        <circle cx="-3" cy="4" r="1" fill="#0d6b4f" />
        <circle cx="3" cy="4" r="1" fill="#0d6b4f" />
      </g>
      {/* Society name */}
      <text
        x="100"
        y="140"
        textAnchor="middle"
        fontFamily="'Outfit', sans-serif"
        fontWeight="400"
        fontSize="8"
        fill="#0d6b4f"
        letterSpacing="0.5"
      >
        Sociedade Recreativa
      </text>
      <text
        x="100"
        y="150"
        textAnchor="middle"
        fontFamily="'Outfit', sans-serif"
        fontWeight="400"
        fontSize="8"
        fill="#0d6b4f"
        letterSpacing="0.5"
      >
        Desportiva e Familiar
      </text>
      {/* Founded */}
      <text
        x="100"
        y="168"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', serif"
        fontWeight="500"
        fontSize="9"
        fill="#D97742"
        letterSpacing="1"
      >
        Fundada em 1911
      </text>
    </svg>
  );
}
