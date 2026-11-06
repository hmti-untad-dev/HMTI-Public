"use client"

import type { Easing } from "motion"
import { motion } from "motion/react"
import { type ReactNode, useRef, useState } from "react"
import { type CoverAnimation, TransitionProvider } from "../page-transition/page-transition"

const EASE: Easing = [0.85, 0, 0.2, 1]
const REDUCED_DURATION = 0.15

type Phase = "idle" | "in" | "out" | "reduced-in" | "reduced-out"

type StripeTransitionProps = {
    children: ReactNode
    color?: string
    stripes?: number
    segments?: number
    duration?: number
    stagger?: number
}

export function StripeTransition({
    children,
    color = "#151515",
    stripes = 8,
    segments = 6,
    duration = 0.5,
    stagger = 0.025,
}: StripeTransitionProps) {
    const [phase, setPhase] = useState<Phase>("idle")
    const pending = useRef(0)
    const resolveRef = useRef<(() => void) | null>(null)

    const settle = (next?: Phase) => () => {
        pending.current -= 1
        if (pending.current !== 0) return
        resolveRef.current?.()
        if (next) setPhase(next)
    }

    const coverIn: CoverAnimation = (reduced) =>
        new Promise((resolve) => {
            resolveRef.current = resolve
            pending.current = stripes * segments
            setPhase(reduced ? "reduced-in" : "in")
        })

    const coverOut: CoverAnimation = (reduced) =>
        new Promise((resolve) => {
            resolveRef.current = resolve
            pending.current = stripes * segments
            setPhase(reduced ? "reduced-out" : "out")
        })

    const covering = phase === "in" || phase === "reduced-in"
    const reduced = phase === "reduced-in" || phase === "reduced-out"

    return (
        <TransitionProvider coverIn={coverIn} coverOut={coverOut}>
            {children}

            <div
                aria-hidden
                className={`pointer-events-none fixed inset-0 z-70 flex ${phase === "idle" ? "invisible" : ""}`}
            >
                {Array.from({ length: stripes }, (_, stripeIndex) => (
                    <div
                        key={stripeIndex}
                        className="not-last:-mr-px flex flex-1 flex-col overflow-hidden"
                    >
                        {Array.from({ length: segments }, (_, segmentIndex) => {
                            const reversedDelay =
                                (stripes - 1 - stripeIndex + (segments - 1 - segmentIndex)) *
                                stagger
                            const forwardDelay = (stripeIndex + segmentIndex) * stagger
                            const delay = covering ? reversedDelay : forwardDelay

                            return (
                                <motion.div
                                    key={segmentIndex}
                                    className="not-last:-mb-px flex-1"
                                    style={{ backgroundColor: color }}
                                    animate={
                                        reduced
                                            ? { opacity: covering ? 1 : 0, x: 0 }
                                            : { opacity: 1, x: covering ? ["101%", "0%"] : "-101%" }
                                    }
                                    transition={
                                        reduced
                                            ? { duration: REDUCED_DURATION }
                                            : { duration, ease: EASE, delay }
                                    }
                                    onAnimationComplete={settle(
                                        phase === "out" || phase === "reduced-out"
                                            ? "idle"
                                            : undefined,
                                    )}
                                />
                            )
                        })}
                    </div>
                ))}
            </div>
        </TransitionProvider>
    )
}
