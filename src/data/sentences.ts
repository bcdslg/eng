import type { Category, Sentence } from "../types";

type SentenceSeed = Category & {
  sentences: Array<[chinese: string, english: string, scene: string]>;
};

const sentenceSeeds: SentenceSeed[] = [
  {
    id: "greetings",
    name: "礼貌问候",
    icon: "👋",
    color: "linear-gradient(135deg, #fff4c9, #cdeeff)",
    sentences: [
      ["你好。", "Hello.", "见到别人时"],
      ["早上好。", "Good morning.", "早晨打招呼"],
      ["晚上好。", "Good evening.", "晚上打招呼"],
      ["再见。", "Goodbye.", "离开时"],
      ["谢谢你。", "Thank you.", "得到帮助时"],
      ["不客气。", "You're welcome.", "回应感谢"],
      ["请。", "Please.", "礼貌请求"],
      ["对不起。", "I'm sorry.", "做错事时"],
      ["没关系。", "That's okay.", "安慰别人"],
      ["打扰一下。", "Excuse me.", "需要别人注意时"]
    ]
  },
  {
    id: "needs",
    name: "生活需求",
    icon: "🥛",
    color: "linear-gradient(135deg, #e5f8d9, #fff0cf)",
    sentences: [
      ["我饿了。", "I am hungry.", "想吃东西"],
      ["我渴了。", "I am thirsty.", "想喝水"],
      ["我想喝水。", "I want some water.", "要水喝"],
      ["我需要帮助。", "I need help.", "需要大人帮忙"],
      ["我困了。", "I am sleepy.", "想睡觉"],
      ["我想去厕所。", "I need to go to the bathroom.", "上厕所"],
      ["我找不到它。", "I can't find it.", "找东西"],
      ["这个给你。", "This is for you.", "递东西给别人"],
      ["我可以要这个吗？", "May I have this?", "礼貌地想要东西"],
      ["我想再来一点。", "I want a little more.", "还想要一些"]
    ]
  },
  {
    id: "feelings",
    name: "情绪感受",
    icon: "😊",
    color: "linear-gradient(135deg, #ffe1ef, #dff5ff)",
    sentences: [
      ["我很开心。", "I am happy.", "表达开心"],
      ["我有点难过。", "I am a little sad.", "表达难过"],
      ["我害怕。", "I am scared.", "表达害怕"],
      ["我累了。", "I am tired.", "表达累了"],
      ["这里疼。", "It hurts here.", "身体不舒服"],
      ["我好多了。", "I feel better.", "感觉变好"],
      ["我不喜欢这个。", "I don't like this.", "表达不喜欢"],
      ["我喜欢这个。", "I like this.", "表达喜欢"],
      ["我很兴奋。", "I am excited.", "期待某件事"],
      ["我需要休息一下。", "I need a break.", "想暂停一下"]
    ]
  },
  {
    id: "classroom",
    name: "课堂表达",
    icon: "📚",
    color: "linear-gradient(135deg, #e7ecff, #fff4d7)",
    sentences: [
      ["我完成了。", "I finished.", "完成任务"],
      ["我不知道。", "I don't know.", "不知道答案"],
      ["你能帮我吗？", "Can you help me?", "请求帮助"],
      ["请再说一遍。", "Please say it again.", "没听清"],
      ["我可以试试吗？", "Can I try?", "想尝试"],
      ["轮到我了吗？", "Is it my turn?", "等待轮流"],
      ["我准备好了。", "I am ready.", "准备开始"],
      ["我还没准备好。", "I am not ready yet.", "还需要时间"],
      ["请慢一点。", "Please slow down.", "希望对方慢一点"],
      ["我有一个问题。", "I have a question.", "想提问"]
    ]
  },
  {
    id: "play",
    name: "游戏互动",
    icon: "🎲",
    color: "linear-gradient(135deg, #ffe2d1, #dcf6e7)",
    sentences: [
      ["我们一起玩吧。", "Let's play together.", "邀请玩耍"],
      ["轮到我了。", "It's my turn.", "游戏轮流"],
      ["轮到你了。", "It's your turn.", "提醒别人"],
      ["等等我。", "Wait for me.", "跟不上时"],
      ["做得好。", "Good job.", "鼓励别人"],
      ["再试一次。", "Try again.", "继续尝试"],
      ["我们分享吧。", "Let's share.", "分享玩具"],
      ["我可以加入吗？", "Can I join?", "想加入游戏"],
      ["我赢了。", "I won.", "游戏赢了"],
      ["没关系，再来一次。", "That's okay. Let's try again.", "输了或失败时"]
    ]
  },
  {
    id: "routines",
    name: "日常习惯",
    icon: "🧼",
    color: "linear-gradient(135deg, #dff7ff, #fff0e6)",
    sentences: [
      ["洗手。", "Wash your hands.", "饭前或外出后"],
      ["刷牙。", "Brush your teeth.", "早晚刷牙"],
      ["穿上鞋子。", "Put on your shoes.", "准备出门"],
      ["收拾一下。", "Clean up, please.", "整理玩具"],
      ["吃饭时间到了。", "Time to eat.", "准备吃饭"],
      ["睡觉时间到了。", "Time to sleep.", "准备睡觉"],
      ["请坐好。", "Please sit down.", "坐下"],
      ["小心一点。", "Be careful.", "提醒安全"],
      ["慢慢来。", "Take your time.", "安慰别着急"],
      ["我们出发吧。", "Let's go.", "准备出门"]
    ]
  }
];

export const sentenceCategories: Category[] = sentenceSeeds.map(({ sentences: _sentences, ...category }) => category);

export const sentences: Sentence[] = sentenceSeeds.flatMap(category =>
  category.sentences.map(([chinese, english, scene], index) => ({
    id: `sentence-${category.id}-${String(index + 1).padStart(3, "0")}`,
    categoryId: category.id,
    categoryName: category.name,
    categoryIcon: category.icon,
    categoryColor: category.color,
    chinese,
    english,
    scene
  }))
);
