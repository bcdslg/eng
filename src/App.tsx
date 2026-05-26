import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { categories, words } from "./data/categories";
import { sentenceCategories, sentences } from "./data/sentences";
import { getSpeakText, loadVoices, speakChinese, speakEnglish, stopSpeech } from "./speech";
import { progressStore } from "./storage/progressStore";
import type { Category, Sentence, StudyProgress, Word } from "./types";

const LOCAL_USER_ID = "local-user";

type ContentMode = "words" | "sentences";
type StudyItem = Word | Sentence;

const categoryEmoji: Record<string, string> = {
  "fruit-vegetables": "🍓",
  toys: "🧸",
  furniture: "🛋️",
  appliances: "💡",
  "daily-items": "🥣",
  clothes: "👕",
  transport: "🚗",
  greetings: "👋",
  needs: "🥛",
  feelings: "😊",
  classroom: "📚",
  play: "🎲",
  routines: "🧼"
};

const wordEmoji: Record<string, string> = {
  apple: "🍎",
  banana: "🍌",
  orange: "🍊",
  strawberry: "🍓",
  grape: "🍇",
  watermelon: "🍉",
  pineapple: "🍍",
  carrot: "🥕",
  broccoli: "🥦",
  tomato: "🍅",
  corn: "🌽",
  pumpkin: "🎃",
  mushroom: "🍄",
  "teddy bear": "🧸",
  ball: "⚽",
  kite: "🪁",
  "toy car": "🚗",
  table: "🪑",
  chair: "🪑",
  sofa: "🛋️",
  bed: "🛏️",
  lamp: "💡",
  tv: "📺",
  television: "📺",
  computer: "💻",
  cellphone: "📱",
  camera: "📷",
  cup: "☕",
  plate: "🍽️",
  bowl: "🥣",
  spoon: "🥄",
  toothbrush: "🪥",
  key: "🔑",
  umbrella: "☂️",
  "t-shirt": "👕",
  shirt: "👔",
  pants: "👖",
  shoes: "👟",
  hat: "🧢",
  car: "🚗",
  bus: "🚌",
  train: "🚆",
  airplane: "✈️",
  boat: "⛵",
  bicycle: "🚲",
  truck: "🚚",
  taxi: "🚕",
  subway: "🚇"
};

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function isSentence(item: StudyItem): item is Sentence {
  return "scene" in item;
}

function getProgressLabel(progress?: StudyProgress) {
  if (!progress || progress.status === "new") return "新内容";
  if (progress.status === "known") return "会说了";
  return "学习中";
}

function getItemEmoji(item: StudyItem) {
  if (isSentence(item)) return categoryEmoji[item.categoryId] || "💬";
  const primaryEnglish = getSpeakText(item.english).toLowerCase();
  return wordEmoji[primaryEnglish] || categoryEmoji[item.categoryId] || "⭐";
}

export function App() {
  const [mode, setMode] = useState<ContentMode>("words");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [progress, setProgress] = useState<Record<string, StudyProgress>>({});
  const [studyIndex, setStudyIndex] = useState<number | null>(null);
  const touchStart = useRef({ x: 0, y: 0 });

  const activeCategories = mode === "words" ? categories : sentenceCategories;
  const activeItems: StudyItem[] = mode === "words" ? words : sentences;
  const modeLabel = mode === "words" ? "单词" : "句子";
  const modeTitle = mode === "words" ? "儿童英语单词卡 - 家中物品" : "儿童英语常用句 - 日常表达";

  useEffect(() => {
    progressStore.getProgress(LOCAL_USER_ID).then(setProgress);
  }, []);

  useEffect(() => {
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
      stopSpeech();
    };
  }, []);

  const visibleItems = useMemo(() => {
    const normalizedQuery = normalize(query);
    return activeItems.filter(item => {
      const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
      const detailText = isSentence(item) ? item.scene : item.pronunciation;
      const matchesQuery =
        !normalizedQuery || normalize(`${item.chinese} ${item.english} ${detailText}`).includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeItems, query, selectedCategory]);

  const groupedItems = useMemo(
    () =>
      activeCategories
        .map(category => ({
          category,
          items: visibleItems.filter(item => item.categoryId === category.id)
        }))
        .filter(group => group.items.length > 0),
    [activeCategories, visibleItems]
  );

  const currentItem = studyIndex === null ? null : visibleItems[studyIndex] ?? null;
  const modeProgress = useMemo(
    () => activeItems.map(item => progress[item.id]).filter(Boolean),
    [activeItems, progress]
  );
  const knownCount = useMemo(() => modeProgress.filter(item => item.status === "known").length, [modeProgress]);
  const favoriteCount = useMemo(() => modeProgress.filter(item => item.favorite).length, [modeProgress]);

  const setModeAndReset = (nextMode: ContentMode) => {
    setMode(nextMode);
    setSelectedCategory("all");
    setQuery("");
    setStudyIndex(null);
    stopSpeech();
  };

  const updateItemProgress = useCallback(async (itemId: string, patch: Partial<StudyProgress>) => {
    const next = await progressStore.updateProgress(LOCAL_USER_ID, itemId, patch);
    setProgress(previous => ({ ...previous, [itemId]: next }));
  }, []);

  const speakItemEnglish = (item: StudyItem) => {
    speakEnglish(item.english);
  };

  const openStudyCard = useCallback(
    (index: number) => {
      const item = visibleItems[index];
      if (!item) return;

      const itemProgress = progress[item.id];
      setStudyIndex(index);
      speakItemEnglish(item);
      updateItemProgress(item.id, {
        status: itemProgress?.status === "known" ? "known" : "learning",
        studiedCount: (itemProgress?.studiedCount ?? 0) + 1,
        lastStudiedAt: new Date().toISOString()
      });
    },
    [progress, updateItemProgress, visibleItems]
  );

  const closeStudyCard = useCallback(() => {
    setStudyIndex(null);
    stopSpeech();
  }, []);

  const showStudyItem = useCallback(
    (step: number) => {
      if (studyIndex === null || visibleItems.length === 0) return;
      const nextIndex = (studyIndex + step + visibleItems.length) % visibleItems.length;
      openStudyCard(nextIndex);
    },
    [openStudyCard, studyIndex, visibleItems.length]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (studyIndex === null) return;
      if (event.key === "Escape") closeStudyCard();
      if (event.key === "ArrowLeft") showStudyItem(-1);
      if (event.key === "ArrowRight") showStudyItem(1);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = studyIndex === null ? "" : "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [closeStudyCard, showStudyItem, studyIndex]);

  const toggleFavorite = (item: StudyItem) => {
    updateItemProgress(item.id, {
      favorite: !progress[item.id]?.favorite
    });
  };

  const toggleKnown = (item: StudyItem) => {
    updateItemProgress(item.id, {
      status: progress[item.id]?.status === "known" ? "learning" : "known",
      lastStudiedAt: new Date().toISOString()
    });
  };

  const renderDetail = (item: StudyItem) => (isSentence(item) ? item.scene : `(${item.pronunciation})`);

  return (
    <>
      <div className="app">
        <header className="hero">
          <div className="title-row">
            <div>
              <p className="eyebrow">Local-first learning</p>
              <h1>{modeTitle}</h1>
            </div>
            <div className="mascot" aria-hidden="true">
              ABC
            </div>
          </div>

          <div className="mode-switch" aria-label="学习内容">
            <button
              className={`mode-btn${mode === "words" ? " active" : ""}`}
              type="button"
              onClick={() => setModeAndReset("words")}
            >
              🔤 单词
            </button>
            <button
              className={`mode-btn${mode === "sentences" ? " active" : ""}`}
              type="button"
              onClick={() => setModeAndReset("sentences")}
            >
              💬 句子
            </button>
          </div>

          <div className="summary">
            <span>共 {activeItems.length} 个{modeLabel}</span>
            <span>已掌握 {knownCount}</span>
            <span>收藏 {favoriteCount}</span>
          </div>

          <div className="controls">
            <label className="search-wrap" htmlFor="searchInput">
              <span aria-hidden="true">🔎</span>
              <input
                id="searchInput"
                type="search"
                placeholder={mode === "words" ? "搜索中文或英文，比如 apple / 苹果" : "搜索句子，比如 help / 帮助"}
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
            </label>

            <nav className="filters" aria-label={`${modeLabel}分类`}>
              <button
                className={`filter-btn${selectedCategory === "all" ? " active" : ""}`}
                type="button"
                onClick={() => setSelectedCategory("all")}
              >
                🌟 全部
              </button>
              {activeCategories.map(category => (
                <button
                  className={`filter-btn${selectedCategory === category.id ? " active" : ""}`}
                  type="button"
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main>
          {groupedItems.map(group => (
            <ContentSection
              category={group.category}
              items={group.items}
              visibleItems={visibleItems}
              progress={progress}
              key={group.category.id}
              onOpen={openStudyCard}
              onSpeak={speakItemEnglish}
              onFavorite={toggleFavorite}
              renderDetail={renderDetail}
            />
          ))}

          {visibleItems.length === 0 && <div className="empty">没有找到匹配的{modeLabel}，换个关键词试试看。</div>}
          <div className="footer">
            当前显示 {visibleItems.length} 个{modeLabel}
          </div>
        </main>
      </div>

      {currentItem && (
        <div className="study-modal open" aria-hidden="false" onClick={closeStudyCard}>
          <section
            className="study-panel"
            style={{ background: currentItem.categoryColor }}
            role="dialog"
            aria-modal="true"
            aria-label={`${modeLabel}学习卡片`}
            onClick={event => event.stopPropagation()}
            onTouchStart={event => {
              const touch = event.changedTouches[0];
              touchStart.current = { x: touch.clientX, y: touch.clientY };
            }}
            onTouchEnd={event => {
              const touch = event.changedTouches[0];
              const deltaX = touch.clientX - touchStart.current.x;
              const deltaY = touch.clientY - touchStart.current.y;
              if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
              showStudyItem(deltaX < 0 ? 1 : -1);
            }}
          >
            <div className="study-topbar">
              <span className="study-category">
                {currentItem.categoryIcon} {currentItem.categoryName}
              </span>
              <button className="study-close" type="button" aria-label="关闭" onClick={closeStudyCard}>
                ×
              </button>
            </div>

            <div className={`study-card${isSentence(currentItem) ? " sentence-study-card" : ""}`}>
              <div className="study-art" aria-hidden="true">
                <span className="study-art-emoji">{getItemEmoji(currentItem)}</span>
                <span className="study-art-label">
                  {isSentence(currentItem) ? currentItem.scene : getSpeakText(currentItem.english)}
                </span>
              </div>
              <p className="study-chinese">{currentItem.chinese}</p>
              <p className="study-english">{currentItem.english}</p>
              {!isSentence(currentItem) && <p className="study-pronunciation">({currentItem.pronunciation})</p>}
              {isSentence(currentItem) && <p className="study-pronunciation">{currentItem.scene}</p>}
              <div className="study-progress-row">
                <span>{getProgressLabel(progress[currentItem.id])}</span>
                <span>已学 {progress[currentItem.id]?.studiedCount ?? 0} 次</span>
              </div>
              <div className="study-actions">
                <button className="study-speak" type="button" onClick={() => speakItemEnglish(currentItem)}>
                  🔊 英文
                </button>
                <button className="study-speak" type="button" onClick={() => speakChinese(currentItem.chinese)}>
                  🔊 中文
                </button>
                <button className="study-speak" type="button" onClick={() => toggleKnown(currentItem)}>
                  {progress[currentItem.id]?.status === "known" ? "↺ 复习" : "✓ 会说了"}
                </button>
              </div>
            </div>

            <div className="study-nav">
              <button className="study-arrow" type="button" aria-label={`上一个${modeLabel}`} onClick={() => showStudyItem(-1)}>
                ‹
              </button>
              <p className="study-hint">
                {(studyIndex ?? 0) + 1} / {visibleItems.length}　左右滑动切换
              </p>
              <button className="study-arrow" type="button" aria-label={`下一个${modeLabel}`} onClick={() => showStudyItem(1)}>
                ›
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

type ContentSectionProps = {
  category: Category;
  items: StudyItem[];
  visibleItems: StudyItem[];
  progress: Record<string, StudyProgress>;
  onOpen: (index: number) => void;
  onSpeak: (item: StudyItem) => void;
  onFavorite: (item: StudyItem) => void;
  renderDetail: (item: StudyItem) => string;
};

function ContentSection({
  category,
  items,
  visibleItems,
  progress,
  onOpen,
  onSpeak,
  onFavorite,
  renderDetail
}: ContentSectionProps) {
  return (
    <section className="category-section">
      <h2 className="category-title">
        <span className="badge">{category.icon}</span>
        {category.name}
      </h2>
      <div className="grid">
        {items.map(item => {
          const itemProgress = progress[item.id];
          const index = visibleItems.findIndex(visibleItem => visibleItem.id === item.id);
          return (
            <article
              className={`card${isSentence(item) ? " sentence-card" : ""}`}
              style={{ "--card-bg": item.categoryColor } as CSSProperties}
              key={item.id}
              onClick={() => onOpen(index)}
            >
              <div className="word-top">
                <p className="chinese">{item.chinese}</p>
                <button
                  className="icon-btn"
                  type="button"
                  aria-label={`朗读 ${item.english}`}
                  title={`朗读 ${item.english}`}
                  onClick={event => {
                    event.stopPropagation();
                    onSpeak(item);
                  }}
                >
                  🔊
                </button>
              </div>
              <p className="english">{item.english}</p>
              <p className="pronunciation">{renderDetail(item)}</p>
              <div className="card-meta">
                <span>{getProgressLabel(itemProgress)}</span>
                <button
                  className={`mini-action${itemProgress?.favorite ? " active" : ""}`}
                  type="button"
                  aria-label={itemProgress?.favorite ? "取消收藏" : "收藏"}
                  onClick={event => {
                    event.stopPropagation();
                    onFavorite(item);
                  }}
                >
                  ★
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
