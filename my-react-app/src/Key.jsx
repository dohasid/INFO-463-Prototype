import React, { useState, useCallback } from "react";

const qjxz = ["q", "j", "x", "z"];

const styles = {
    key: {
        width: "80px",
        height: "80px",
        background: "#eee",
        border: "1px solid #aaa",
        borderRadius: "6px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "24px",
        position: "relative",
        cursor: "pointer",
        userSelect: "none",
        boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)",
        transition: "box-shadow 0.15s ease, background-color 0.15s ease, border-color 0.15s ease"
    },
    keyHover: {
        boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.3)",
        backgroundColor: "#f5f5f5",
        borderColor: "#888"
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none"
    },
    overlayLetter: {
        position: "absolute",
        width: "60px",
        height: "60px",
        background: "pink",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "22px",
        fontWeight: "bold",
        borderRadius: "5px",
        cursor: "pointer",
        pointerEvents: "auto",
        boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)",
        transition: "transform 0.1s"
    },
    overlayLetterHover: {
        transform: "scale(1.4)",
        zIndex: 100
    },
    mostLikely: { backgroundColor: "#ffeb3b" },
    top: { top: 0, left: "50%", transform: "translate(-50%, -100%)" },
    left: { top: "50%", left: 0, transform: "translate(-100%, -50%)" },
    right: { top: "50%", left: "100%", transform: "translate(0, -50%)" },
    bottom: { top: "100%", left: "50%", transform: "translate(-50%, 0%)" }
};

const posStyles = {
    top: styles.top,
    left: styles.left,
    right: styles.right,
    bottom: styles.bottom
};

const Key = ({ letter, isUpper, trialActive, recordKeystroke, overlayPredictions }) => {
    const [hoverKey, setHoverKey] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [hoverOverlay, setHoverOverlay] = useState(null);

    const applyCase = useCallback(
        (ch) => (isUpper ? ch.toUpperCase() : ch.toLowerCase()),
        [isUpper]
    );

    const keyContent = letter === "." ? letter : applyCase(letter);

    const getOverlayLetters = () => {
        if (letter === "qjxz") return qjxz;
        return overlayPredictions[letter] || [];
    };

    const handleKeyClick = (e) => {
        e.stopPropagation();
        if (!trialActive) return;

        if (letter === ".") {
            recordKeystroke(".");
            return;
        }

        const preds = overlayPredictions[letter] || [];
        const isCompound = letter === "qjxz";

        // Keys with overlays: first click only opens overlay, no typing yet.
        if (preds.length > 0 || isCompound) {
            setShowOverlay(true);
            return;
        }

        // Simple key with no overlay.
        recordKeystroke(letter);
    };

    const handleOverlayClick = (e, l) => {
        e.stopPropagation();
        if (!trialActive) return;
        recordKeystroke(l);     // one char
        setShowOverlay(false);  // hide so same click can't re-fire
    };

    const keyStyle = hoverKey
        ? { ...styles.key, ...styles.keyHover }
        : styles.key;

    return (
        <div
            style={keyStyle}
            onClick={handleKeyClick}
            onMouseEnter={() => setHoverKey(true)}
            onMouseLeave={() => {
                setHoverKey(false);
                setShowOverlay(false);
            }}
        >
            {keyContent}

            {showOverlay && (
                <div style={styles.overlay} data-overlay>
                    {getOverlayLetters().map((l, i) => {
                        const pos = ["top", "left", "right", "bottom"];
                        const positionStyle = posStyles[pos[i] || "top"];
                        const mostLikelyStyle = i === 0 ? styles.mostLikely : {};
                        const isHover = hoverOverlay === l;

                        return (
                            <div
                                key={l}
                                style={{
                                    ...styles.overlayLetter,
                                    ...positionStyle,
                                    ...mostLikelyStyle,
                                    ...(isHover ? styles.overlayLetterHover : {})
                                }}
                                onClick={(e) => handleOverlayClick(e, l)}
                                onMouseEnter={() => setHoverOverlay(l)}
                                onMouseLeave={() => setHoverOverlay(null)}
                            >
                                {applyCase(l)}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Key;
