import { useState } from "react";
import { TopNavigation } from "../components/TopNavigation";
import { BackArrowIcon, ChevronRightIcon, LayersIcon, SearchIcon } from "../components/icons/BuildPlanIcons";
import { HandIcon, NoEntryIcon } from "../components/icons/GeoIcons";
import styles from "./GeoTestsPage.module.css";

type TestStatus = "draft" | "scheduled" | "in-progress" | "complete";

type GeoTest = {
  id: string;
  testName: string;
  testId: string;
  contribution: string;
  conversionType: string;
  type: "Holdout" | "Lift";
  implementation: "Manual" | "Automated";
  dateRangeLabel: string;
  progressPct: number;
  status: TestStatus;
};

const STATUS_LABEL: Record<TestStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  "in-progress": "In Progress",
  complete: "Complete",
};

const STATUS_CLASS: Record<TestStatus, string> = {
  draft: styles.statusDraft,
  scheduled: styles.statusScheduled,
  "in-progress": styles.statusInProgress,
  complete: styles.statusComplete,
};

const TESTS: GeoTest[] = [
  {
    id: "12835",
    testName: "Pinterest Multi Tactic - WR",
    testId: "ID 12835",
    contribution: "-",
    conversionType: "Online Orders",
    type: "Holdout",
    implementation: "Manual",
    dateRangeLabel: "Aug 18 - Sep 23, 2026",
    progressPct: 100,
    status: "complete",
  },
];

const FILTERS = ["All", "Draft", "Scheduled", "In Progress", "Finished"] as const;

export function GeoTestsPage() {
  const [miaOpen, setMiaOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");

  const visibleTests = TESTS.filter((test) => {
    if (query && !test.testName.toLowerCase().includes(query.toLowerCase())) return false;
    if (activeFilter === "All") return true;
    if (activeFilter === "In Progress") return test.status === "in-progress";
    if (activeFilter === "Finished") return test.status === "complete";
    return STATUS_LABEL[test.status] === activeFilter;
  });

  return (
    <div className={styles.page}>
      <TopNavigation miaOpen={miaOpen} onMiaToggle={() => setMiaOpen((v) => !v)} />
      <div className={styles.body}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Geo Tests</h1>
          <div className={styles.headerActions}>
            <a href="#" className={styles.backLink}>
              <BackArrowIcon size={14} />
              Back to the old version
            </a>
            <button type="button" className={styles.learnMoreBtn}>
              Learn more
            </button>
          </div>
        </div>

        <div className={styles.ctaBanner}>
          <h2 className={styles.ctaTitle}>Create a New Test</h2>
          <p className={styles.ctaSubtitle}>Find your media's true performance with Geo Designer.</p>
          <button type="button" className={styles.ctaBtn}>
            Get started
          </button>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>3 / 4</div>
            <div className={styles.statLabel}>Test Cells Available</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>9.90%</div>
            <div className={styles.statLabel}>Optimal Test Cell Size</div>
          </div>
        </div>

        <div className={styles.listCard}>
          <div className={styles.toolbar}>
            <div className={styles.filterTabs}>
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={activeFilter === filter ? `${styles.filterTab} ${styles.filterTabActive}` : styles.filterTab}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className={styles.search}>
              <SearchIcon size={16} />
              <input
                type="text"
                placeholder="Search tests"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Contribution</th>
                <th>Conversion Type</th>
                <th>Type</th>
                <th>Implementation</th>
                <th>Test Dates</th>
                <th>Status</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {visibleTests.map((test) => (
                <tr key={test.id}>
                  <td>
                    <div className={styles.testNameCell}>
                      <a href="#" className={styles.testNameLink}>
                        {test.testName}
                      </a>
                      <span className={styles.testId}>{test.testId}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contributionCell}>
                      <LayersIcon size={16} />
                      {test.contribution}
                    </div>
                  </td>
                  <td>{test.conversionType}</td>
                  <td>
                    <div className={styles.typeCell}>
                      <NoEntryIcon size={16} />
                      {test.type}
                    </div>
                  </td>
                  <td>
                    <div className={styles.typeCell}>
                      <HandIcon size={16} />
                      {test.implementation}
                    </div>
                  </td>
                  <td>
                    <div className={styles.datesCell}>
                      <span className={styles.datesLabel}>{test.dateRangeLabel}</span>
                      <div className={styles.progressTrack}>
                        <div className={styles.progressFill} style={{ width: `${test.progressPct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusPill} ${STATUS_CLASS[test.status]}`}>
                      {STATUS_LABEL[test.status]}
                    </span>
                  </td>
                  <td>
                    <button type="button" className={styles.detailBtn} aria-label={`View ${test.testName}`}>
                      <ChevronRightIcon size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {visibleTests.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "var(--gray-800)", padding: "28px 16px" }}>
                    No tests match your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
