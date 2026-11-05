"use client";

import { useEffect, useId, useRef, useState } from "react";

import {
  aktifOf,
  COHORTS,
  KEANGGOTAAN_PER,
  TOTAL_AKTIF,
  TOTAL_ALUMNI,
  WISUDAWAN,
} from "@/content/keanggotaan";
import { CountUp } from "../ui/CountUp";

type Series = "alumni" | "aktif" | "pasif";
const SERIES: { key: Series; label: string }[] = [
  { key: "alumni", label: "Alumni" },
  { key: "aktif", label: "Anggota aktif" },
  { key: "pasif", label: "Pasif" },
];

const MAX = Math.max(...COHORTS.map((c) => c.purna + aktifOf(c) + c.pasif));
const TICKS = [0, 100, 200, 300].filter((t) => t <= Math.ceil(MAX / 100) * 100);
const TOP = TICKS[TICKS.length - 1];

/**
 * "HMTI dalam angka": angka utama (alumni, anggota aktif, wisudawan, pengurus) dan grafik batang bertumpuk komposisi
 * anggota per angkatan. Klik angka atau legenda untuk menyorot satu kelompok; arahkan/fokus ke batang untuk rincian.
 * Batang tumbuh saat masuk layar. Tersedia tampilan tabel. Warna lolos validator (terang & gelap), Pasif sengaja abu.
 */
type Props = {
  pengurus?: number;
  pengurusYear?: number;
  /** Tampilkan angka utama (beranda). */
  numbers?: boolean;
  /** Tampilkan grafik komposisi per angkatan (halaman Tentang). */
  chart?: boolean;
};

export function MembershipStats({
  pengurus,
  pengurusYear,
  numbers = true,
  chart: withChart = true,
}: Props) {
  const [focus, setFocus] = useState<Series | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const chart = useRef<HTMLDivElement>(null);
  const tipId = useId();

  useEffect(() => {
    const el = chart.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = (s: Series) => setFocus((f) => (f === s ? null : s));
  const dim = (s: Series) => (focus && focus !== s ? "is-dim" : "");
  const cohort = hover !== null ? COHORTS[hover] : null;

  const headline = [
    {
      key: "alumni" as const,
      value: TOTAL_ALUMNI,
      label: "Alumni",
      note: "anggota purna yang sudah lulus",
    },
    {
      key: "aktif" as const,
      value: TOTAL_AKTIF,
      label: "Anggota aktif",
      note: "Biasa, Muda, Demisioner",
    },
    {
      key: null,
      value: WISUDAWAN.count,
      label: `Wisudawan ${WISUDAWAN.year}`,
      note: "lulus tahun ini",
    },
    ...(typeof pengurus === "number"
      ? [
          {
            key: null,
            value: pengurus,
            label: "Pengurus aktif",
            note: pengurusYear ? `periode ${pengurusYear}` : "periode berjalan",
          },
        ]
      : []),
  ];

  return (
    <div className="mstats">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-link">
          HMTI dalam angka
        </h2>
        <p className="font-mono text-[0.68rem] text-ink-muted">
          buku induk keanggotaan · per {KEANGGOTAAN_PER}
        </p>
      </div>

      {numbers && (
        <dl className="mt-3 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
          {headline.map((h) => {
            const active = h.key && focus === h.key;
            const body = (
              <>
                <dd className="font-display text-3xl font-bold text-link sm:text-4xl">
                  <CountUp value={h.value} />
                </dd>
                <dt className="mt-1 flex items-center gap-2 text-sm font-medium">
                  {h.key && (
                    <span
                      aria-hidden="true"
                      className={`mstats-swatch s-${h.key}`}
                    />
                  )}
                  {h.label}
                </dt>
                <p className="text-xs text-ink-muted">{h.note}</p>
              </>
            );
            return (
              <div
                key={h.label}
                className={`bg-surface ${active ? "mstats-on" : ""}`}
              >
                {h.key && withChart ? (
                  <button
                    type="button"
                    onClick={() => toggle(h.key!)}
                    aria-pressed={Boolean(active)}
                    className="block h-full w-full p-4 text-left transition-colors hover:bg-surface-raised sm:p-5"
                  >
                    {body}
                  </button>
                ) : (
                  <div className="p-4 sm:p-5">{body}</div>
                )}
              </div>
            );
          })}
        </dl>
      )}

      {withChart && (
        <div
          className={`${numbers ? "mt-6" : "mt-3"} border border-line bg-surface p-4 sm:p-5`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium">
              Komposisi anggota per angkatan
            </p>
            <ul
              className="flex flex-wrap gap-1.5"
              aria-label="Legenda (klik untuk menyorot)"
            >
              {SERIES.map((s) => (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => toggle(s.key)}
                    aria-pressed={focus === s.key}
                    className={`flex items-center gap-1.5 border px-2.5 py-1 text-xs transition-colors ${focus === s.key ? "border-ink text-ink" : "border-line text-ink-muted hover:text-ink"}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mstats-swatch s-${s.key}`}
                    />
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div
            ref={chart}
            className="mstats-chart mt-4"
            data-shown={shown}
            onPointerLeave={() => setHover(null)}
          >
            <div className="mstats-axis" aria-hidden="true">
              {TICKS.map((t) => (
                <span key={t} style={{ bottom: `${(t / TOP) * 100}%` }}>
                  {t}
                </span>
              ))}
            </div>
            <ol
              className="mstats-bars"
              aria-describedby={cohort ? tipId : undefined}
            >
              {COHORTS.map((c, i) => {
                const aktif = aktifOf(c);
                const total = c.purna + aktif + c.pasif;
                return (
                  <li key={c.year} className="mstats-col">
                    <button
                      type="button"
                      className={`mstats-bar ${hover === i ? "is-hover" : ""}`}
                      style={{
                        height: `${(total / TOP) * 100}%`,
                        transitionDelay: `${i * 45}ms`,
                      }}
                      onPointerEnter={() => setHover(i)}
                      onFocus={() => setHover(i)}
                      onBlur={() => setHover(null)}
                      aria-label={`Angkatan ${c.year}: ${total} anggota. Alumni ${c.purna}, aktif ${aktif}, pasif ${c.pasif}.`}
                    >
                      <span
                        className={`seg s-pasif ${dim("pasif")}`}
                        style={{ flexGrow: c.pasif }}
                      />
                      <span
                        className={`seg s-aktif ${dim("aktif")}`}
                        style={{ flexGrow: aktif }}
                      />
                      <span
                        className={`seg s-alumni ${dim("alumni")}`}
                        style={{ flexGrow: c.purna }}
                      />
                    </button>
                    <span className="mstats-x">{String(c.year).slice(2)}</span>
                  </li>
                );
              })}
            </ol>
            {cohort && hover !== null && (
              <div
                id={tipId}
                role="status"
                className="mstats-tip"
                style={{ left: `${((hover + 0.5) / COHORTS.length) * 100}%` }}
              >
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-muted">
                  Angkatan {cohort.year}
                </p>
                <p className="font-display text-lg font-bold">
                  {cohort.purna + aktifOf(cohort) + cohort.pasif} anggota
                </p>
                <dl className="mt-1 grid grid-cols-[auto_auto] gap-x-4 text-xs">
                  {[
                    ["Purna (alumni)", cohort.purna],
                    ["Demisioner", cohort.demisioner],
                    ["Biasa", cohort.biasa],
                    ["Muda", cohort.muda],
                    ["Pasif", cohort.pasif],
                  ]
                    .filter(([, v]) => Number(v) > 0)
                    .map(([k, v]) => (
                      <div key={String(k)} className="contents">
                        <dt className="text-ink-muted">{k}</dt>
                        <dd className="text-right tabular-nums">{v}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            )}
          </div>
          <p className="mt-2 text-center font-mono text-[0.65rem] text-ink-muted">
            angkatan (20xx)
          </p>

          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-ink-muted hover:text-ink">
              Lihat sebagai tabel
            </summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-xs tabular-nums">
                <thead className="text-ink-muted">
                  <tr>
                    <th className="py-1 pr-3 font-medium">Angkatan</th>
                    <th className="py-1 pr-3 font-medium">Alumni</th>
                    <th className="py-1 pr-3 font-medium">Aktif</th>
                    <th className="py-1 pr-3 font-medium">Pasif</th>
                    <th className="py-1 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {COHORTS.map((c) => (
                    <tr key={c.year} className="border-t border-line">
                      <td className="py-1 pr-3">{c.year}</td>
                      <td className="py-1 pr-3">{c.purna}</td>
                      <td className="py-1 pr-3">{aktifOf(c)}</td>
                      <td className="py-1 pr-3">{c.pasif}</td>
                      <td className="py-1">{c.purna + aktifOf(c) + c.pasif}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
