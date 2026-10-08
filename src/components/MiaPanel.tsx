import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "./icons/BuildPlanIcons";
import { CloseIcon } from "./icons/CloseIcon";
import { SendIcon } from "./icons/SendIcon";
import { SparkleIcon } from "./icons/SparkleIcon";
import styles from "./MiaPanel.module.css";

type Message = { id: string; role: "mia" | "user"; text: string };

type QuestionOption = { id: string; label: string; desc: string };

type Question = { label: string; prompt: string; options?: QuestionOption[] };

/** The guided intake flow for setting up a new geo test. Only the first question (the overall
 * objective) uses MPO's numbered-option-card pattern -- the rest are plain free-text questions,
 * since campaign names, segments, dates, and markets vary too much per brand to usefully
 * enumerate as presets. */
const QUESTIONS: Question[] = [
  {
    label: "Objective",
    prompt: "What would you like to learn today?",
    options: [
      {
        id: "incrementality",
        label: "Prove incrementality",
        desc: "See if a channel or tactic is really driving sales, orders, or sign-ups vs. matched control markets",
      },
      {
        id: "efficiency",
        label: "Get a true efficiency number",
        desc: "Turn the lift into incremental ROAS or CPO and compare it to our target",
      },
      {
        id: "budget-decision",
        label: "Make a budget decision",
        desc: "Decide whether to cut, hold, or grow spend on a channel",
      },
    ],
  },
  { label: "Campaigns", prompt: "Which ad campaigns should we focus on?" },
  { label: "Segment", prompt: "Which customer segment is this about?" },
  { label: "Deadline", prompt: "What date do you need the answer by?" },
  { label: "Excluded markets", prompt: "Which markets should we leave out?" },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MiaPanel({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [choice, setChoice] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");
  const [draft, setDraft] = useState("");
  const [done, setDone] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);
  const draftInputRef = useRef<HTMLTextAreaElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!open || startedRef.current) return;
    startedRef.current = true;
    setMessages([
      { id: "welcome", role: "mia", text: "Let's set up a new geo test." },
      { id: "q0", role: "mia", text: QUESTIONS[0].prompt },
    ]);
  }, [open]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, done, choice]);

  useEffect(() => {
    if (open && !done && step > 0) draftInputRef.current?.focus();
  }, [open, done, step]);

  useEffect(() => {
    if (!open || done || step !== 0) return;
    const options = QUESTIONS[0].options!;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      const digit = Number(e.key);
      if (!Number.isInteger(digit) || digit < 1) return;
      if (digit <= options.length) {
        e.preventDefault();
        setChoice(options[digit - 1].id);
      } else if (digit === options.length + 1) {
        e.preventDefault();
        otherInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, done, step]);

  const submitAnswer = (text: string) => {
    setMessages((prev) => [...prev, { id: `u-${step}`, role: "user", text }]);
    setAnswers((prev) => [...prev, text]);
    setChoice(null);
    setOtherText("");
    setDraft("");

    if (step < QUESTIONS.length - 1) {
      const next = step + 1;
      setStep(next);
      setMessages((prev) => [...prev, { id: `q${next}`, role: "mia", text: QUESTIONS[next].prompt }]);
    } else {
      setDone(true);
      setMessages((prev) => [...prev, { id: "wrap", role: "mia", text: "Here's what I'll set up:" }]);
    }
  };

  const handleChoiceNext = () => {
    if (!choice) return;
    const options = QUESTIONS[0].options!;
    const answerText = choice === "other" ? otherText.trim() : options.find((o) => o.id === choice)!.label;
    if (!answerText) return;
    submitAnswer(answerText);
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    submitAnswer(text);
  };

  if (!open) return null;

  const onFirstQuestion = step === 0;

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>
          <SparkleIcon size={18} variant="fill" />
          Mia
        </h2>
        <button type="button" className={styles.closeBtn} aria-label="Close" onClick={onClose}>
          <CloseIcon size={18} />
        </button>
      </div>

      <div className={styles.messages} ref={messagesRef}>
        {messages.map((m) =>
          m.role === "mia" ? (
            <p key={m.id} className={styles.miaText}>
              {m.text}
            </p>
          ) : (
            <div key={m.id} className={styles.bubbleUser}>
              <p>{m.text}</p>
            </div>
          ),
        )}

        {!done && onFirstQuestion && (
          <div className={styles.turn}>
            <div className={styles.methods}>
              {QUESTIONS[0].options!.map((opt, i) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.methodCard} ${choice === opt.id ? styles.methodCardSelected : ""}`}
                  onClick={() => setChoice(opt.id)}
                >
                  <div className={styles.methodIcon}>{choice === opt.id ? <CheckIcon size={14} /> : i + 1}</div>
                  <div>
                    <h4>{opt.label}</h4>
                    <p>{opt.desc}</p>
                  </div>
                </button>
              ))}
              <label
                className={`${styles.methodCard} ${styles.otherOptionCard} ${
                  choice === "other" ? styles.methodCardSelected : ""
                }`}
              >
                <div className={styles.methodIcon}>
                  {choice === "other" ? <CheckIcon size={14} /> : QUESTIONS[0].options!.length + 1}
                </div>
                <input
                  ref={otherInputRef}
                  type="text"
                  className={styles.otherOptionInput}
                  placeholder="Something else…"
                  value={otherText}
                  onChange={(e) => {
                    setOtherText(e.target.value);
                    setChoice(e.target.value.trim() ? "other" : null);
                  }}
                />
              </label>
            </div>
            <div className={styles.turnActions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={!choice || (choice === "other" && !otherText.trim())}
                onClick={handleChoiceNext}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {done && (
          <div className={styles.reviewCard}>
            {QUESTIONS.map((q, i) => (
              <div key={q.label} className={styles.reviewRow}>
                <span className={styles.reviewLabel}>{q.label}</span>
                <span className={styles.reviewValue}>{answers[i]}</span>
              </div>
            ))}
            <button type="button" className={styles.createBtn}>
              Create Test
            </button>
          </div>
        )}
      </div>

      {!done && !onFirstQuestion && (
        <div className={styles.composer}>
          <div className={styles.composerBox}>
            <textarea
              ref={draftInputRef}
              className={styles.composerInput}
              placeholder="Type your answer…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
            />
            <div className={styles.composerToolbar}>
              <span className={styles.composerSpacer} />
              <button
                type="button"
                className={styles.sendIconBtn}
                disabled={!draft.trim()}
                onClick={handleSend}
                aria-label="Send"
              >
                <SendIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
