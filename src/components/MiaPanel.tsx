import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "./icons/CloseIcon";
import { SendIcon } from "./icons/SendIcon";
import { SparkleIcon } from "./icons/SparkleIcon";
import styles from "./MiaPanel.module.css";

type Message = { id: string; role: "mia" | "user"; text: string };

type Question = { label: string; prompt: string; placeholder: string };

/** The guided intake flow for setting up a new geo test -- each question's placeholder doubles
 * as an example of the kind of answer Mia expects, shown until the user starts typing their own. */
const QUESTIONS: Question[] = [
  {
    label: "Objective",
    prompt: "What would you like to learn today?",
    placeholder:
      "e.g. Whether YouTube is driving incremental Vans orders in the UK, or if that spend would perform better elsewhere.",
  },
  {
    label: "Campaigns",
    prompt: "Which ad campaigns should we focus on?",
    placeholder: "e.g. YouTube Awareness. Brand, Search, and Shopping should keep running as-is.",
  },
  {
    label: "Segment",
    prompt: "Which customer segment is this about?",
    placeholder: "e.g. New shoppers. Existing buyers should stay out of this test.",
  },
  {
    label: "Deadline",
    prompt: "What date do you need the answer by?",
    placeholder: "e.g. 16 November, before the holiday push.",
  },
  {
    label: "Excluded markets",
    prompt: "Which markets should we leave out?",
    placeholder: "e.g. London should stay out. The rest of the UK can be included.",
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onCreateTest: (answers: string[]) => void;
};

export function MiaPanel({ open, onClose, onCreateTest }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
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
  }, [messages, done]);

  useEffect(() => {
    if (open && !done) inputRef.current?.focus();
  }, [open, step, done]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setMessages((prev) => [...prev, { id: `u-${step}`, role: "user", text }]);
    setAnswers((prev) => [...prev, text]);

    if (step < QUESTIONS.length - 1) {
      const next = step + 1;
      setStep(next);
      setMessages((prev) => [...prev, { id: `q${next}`, role: "mia", text: QUESTIONS[next].prompt }]);
    } else {
      setDone(true);
      setMessages((prev) => [...prev, { id: "wrap", role: "mia", text: "Here's what I'll set up:" }]);
    }
  };

  const handleCreateTest = () => {
    onCreateTest(answers);
    onClose();
  };

  if (!open) return null;

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

        {done && (
          <div className={styles.reviewCard}>
            {QUESTIONS.map((q, i) => (
              <div key={q.label} className={styles.reviewRow}>
                <span className={styles.reviewLabel}>{q.label}</span>
                <span className={styles.reviewValue}>{answers[i]}</span>
              </div>
            ))}
            <button type="button" className={styles.createBtn} onClick={handleCreateTest}>
              Create Test
            </button>
          </div>
        )}
      </div>

      {!done && (
        <div className={styles.composer}>
          <div className={styles.composerBox}>
            <textarea
              ref={inputRef}
              className={styles.composerInput}
              placeholder={QUESTIONS[step]?.placeholder}
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
