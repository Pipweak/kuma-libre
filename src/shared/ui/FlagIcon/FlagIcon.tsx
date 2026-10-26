import type { ReactElement, SVGProps } from 'react';

export type FlagCode = 'en' | 'es' | 'fr' | 'ja';

export type FlagIconProps = Omit<SVGProps<SVGSVGElement>, 'aria-label'> & {
  code: FlagCode;
  label?: string;
};

function FlagArtwork({ code }: Pick<FlagIconProps, 'code'>): ReactElement {
  if (code === 'ja') {
    return (
      <>
        <rect fill="#fff" height="18" width="27" />
        <circle cx="13.5" cy="9" fill="#bc002d" r="5.2" />
      </>
    );
  }

  if (code === 'fr') {
    return (
      <>
        <rect fill="#002654" height="18" width="9" />
        <rect fill="#fff" height="18" width="9" x="9" />
        <rect fill="#ed2939" height="18" width="9" x="18" />
      </>
    );
  }

  if (code === 'es') {
    return (
      <>
        <rect fill="#aa151b" height="18" width="27" />
        <rect fill="#f1bf00" height="10" width="27" y="4" />
      </>
    );
  }

  return (
    <>
      <rect fill="#012169" height="18" width="27" />
      <path d="M0 0 27 18M27 0 0 18" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 27 18M27 0 0 18" stroke="#c8102e" strokeWidth="2" />
      <path d="M13.5 0v18M0 9h27" stroke="#fff" strokeWidth="6" />
      <path d="M13.5 0v18M0 9h27" stroke="#c8102e" strokeWidth="3.2" />
    </>
  );
}

/** Small internal flag asset; surrounding controls still provide textual meaning. */
export function FlagIcon({ className, code, label, ...svgProps }: FlagIconProps): ReactElement {
  return (
    <svg
      {...svgProps}
      aria-hidden={label === undefined}
      aria-label={label}
      className={['border-line h-4 w-6 shrink-0 overflow-hidden rounded-[3px] border', className]
        .filter(Boolean)
        .join(' ')}
      role={label === undefined ? undefined : 'img'}
      viewBox="0 0 27 18"
    >
      <FlagArtwork code={code} />
    </svg>
  );
}
