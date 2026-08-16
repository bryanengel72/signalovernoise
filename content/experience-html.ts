import { identity } from './identity';
import { experienceCopy } from './sections/experience';

/**
 * The scroll-film's Copy, rendered to the HTML fragments its markup expects.
 *
 * /experience is a build entry but not a React page — it keeps its own runtime
 * and its markup stays static in the output, which is what a marketing page
 * wants. So its Copy is substituted into the HTML at build time by the
 * `experience-content` plugin in vite.config.ts.
 *
 * This lives beside the Copy rather than inside the Vite config so a test can
 * assert that every %TOKEN% in the HTML has a value here. A placeholder with no
 * entry would otherwise ship to production as literal text.
 */

const c = experienceCopy;
const headline = (h: { lead: string; emphasis: string }) => `${h.lead} <b>${h.emphasis}</b>`;

export const experienceReplacements: Record<string, string> = {
  '%EMAIL%': identity.email,
  '%BOOKING_SLUG%': identity.booking.slug,
  '%BOOKING_NAMESPACE%': identity.booking.namespace,
  '%BOOKING_CONFIG%': identity.booking.config,

  '%META_TITLE%': c.meta.title,
  '%META_DESCRIPTION%': c.meta.description,
  '%OG_TITLE%': c.meta.ogTitle,
  '%OG_DESCRIPTION%': c.meta.ogDescription,

  '%NAV%': c.nav.map((l) => `<a href="${l.href}">${l.label}</a>`).join('\n        '),
  '%NAV_CTA%': c.navCta,

  '%CHAPTER_ONE%': `${c.chapters[0].n} / ${c.chapters[0].name}`,
  '%SCROLL_HINT%': c.scrollHint,
  '%LOADER_LABEL%': c.loaderLabel,
  '%OPENING_BEAT%': c.openingBeat,
  '%TAGLINE%': c.tagline,
  '%FILM_CTA_PRIMARY%': c.filmCtaPrimary,
  '%FILM_CTA_SECONDARY%': c.filmCtaSecondary,

  '%MANIFESTO_LEADIN%': c.manifesto.leadIn,
  '%MANIFESTO_BODY%': c.manifesto.body,

  '%CAP_LEADIN%': c.capabilities.leadIn,
  '%CAP_HEADLINE%': headline(c.capabilities.headline),
  '%CAP_SUB%': c.capabilities.sub,
  '%CAP_GRID%': c.capabilities.items
    .map(
      (i) =>
        `<div class="cap reveal"><div class="n">${i.num}</div><h3>${i.title}</h3><p>${i.desc}</p></div>`,
    )
    .join('\n        '),

  '%PROOF_LEADIN%': c.proof.leadIn,
  '%PROOF_HEADLINE%': headline(c.proof.headline),
  '%PROOF_COLUMNS%':
    `<div>${c.proof.columns.process}</div>` +
    `<div style="text-align:center">${c.proof.columns.before}</div>` +
    `<div></div>` +
    `<div style="text-align:center">${c.proof.columns.after}</div>` +
    `<div style="text-align:right">${c.proof.columns.gain}</div>`,
  '%DELTA_ROWS%': c.proof.rows
    .map(
      (r) =>
        `<div class="delta-row reveal"><div class="proc">${r.process}</div>` +
        `<div class="before mono">${r.before}</div><div class="arr">→</div>` +
        `<div class="after mono">${r.after}</div><div class="gain">${r.gain}</div></div>`,
    )
    .join('\n        '),

  '%CTA_LEADIN%': c.cta.leadIn,
  '%CTA_HEADLINE%': headline(c.cta.headline),
  '%CTA_SUB%': c.cta.sub,
  '%CTA_PRIMARY%': c.cta.primary,
  '%CTA_SECONDARY%': c.cta.secondary,
  '%CTA_FINE%': c.cta.fine,

  '%FOOTER_COPYRIGHT%': c.footer.copyright,
  '%FOOTER_LINKS%': c.footer.links
    .map((l) => `<a href="${l.href}">${l.label}</a>`)
    .join('\n        '),
};

/** Substitute every %TOKEN% the film's HTML declares. */
export const renderExperienceHtml = (html: string): string =>
  Object.entries(experienceReplacements).reduce(
    (out, [token, value]) => out.split(token).join(value),
    html,
  );
