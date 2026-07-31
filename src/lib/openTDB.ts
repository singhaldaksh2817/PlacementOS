/**
 * OpenTDB (Open Trivia Database) API wrapper
 * Free API — no key required
 * Docs: https://opentdb.com/api_config.php
 */

export interface OpenTDBQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
  difficulty: string;
}

// Map OpenTDB categories to our aptitude categories
const CATEGORY_MAP: Record<string, { id: number; label: string }> = {
  Quantitative: { id: 19, label: 'Mathematics' },         // Mathematics
  Logical:      { id: 18, label: 'Science: Computers' }, // Science: Computers
  CS:           { id: 18, label: 'Science: Computers' }, // Science: Computers
  Verbal:       { id: 10, label: 'Entertainment: Books' }, // Books / Language
  all:          { id: 9,  label: 'General Knowledge' },
};

function decodeHTML(str: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function fetchAptitudeQuestions(
  category: string = 'all',
  count: number = 10,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<OpenTDBQuestion[]> {
  const cat = CATEGORY_MAP[category] || CATEGORY_MAP['all'];
  const url = `https://opentdb.com/api.php?amount=${count}&category=${cat.id}&difficulty=${difficulty}&type=multiple`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('OpenTDB API error');
    const data = await res.json();

    if (data.response_code !== 0 || !data.results?.length) {
      throw new Error('No questions returned');
    }

    return data.results.map((q: any, i: number) => {
      const incorrect = q.incorrect_answers.map(decodeHTML);
      const correct = decodeHTML(q.correct_answer);

      // Shuffle options and find new correct index
      const options = shuffleArray([correct, ...incorrect]);
      const correctIdx = options.indexOf(correct);

      return {
        id: `opentdb-${category}-${i}-${Date.now()}`,
        question: decodeHTML(q.question),
        options,
        correct: correctIdx,
        explanation: `The correct answer is: ${correct}`,
        category,
        difficulty: q.difficulty,
      };
    });
  } catch (err) {
    console.warn('[OpenTDB] Fetch failed, using fallback questions:', err);
    return getFallbackQuestions(category, count);
  }
}

/** Fallback if OpenTDB is down or rate-limited */
function getFallbackQuestions(category: string, count: number): OpenTDBQuestion[] {
  const fallbacks: OpenTDBQuestion[] = [
    {
      id: 'fb1', question: 'A train travels 60 km in 45 minutes. What is its speed in km/h?',
      options: ['80 km/h', '75 km/h', '90 km/h', '70 km/h'], correct: 0,
      explanation: 'Speed = Distance/Time = 60/(45/60) = 60×(60/45) = 80 km/h',
      category: 'Quantitative', difficulty: 'medium',
    },
    {
      id: 'fb2', question: 'If all Blokes are Snorbs and no Snorbs are Twerps, which conclusion is valid?',
      options: ['No Blokes are Twerps', 'Some Blokes are Twerps', 'All Twerps are Blokes', 'None of the above'], correct: 0,
      explanation: 'If Blokes ⊂ Snorbs and Snorbs ∩ Twerps = ∅, then Blokes ∩ Twerps = ∅.',
      category: 'Logical', difficulty: 'medium',
    },
    {
      id: 'fb3', question: 'What is the time complexity of Binary Search?',
      options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'], correct: 0,
      explanation: 'Binary Search halves the search space each time → O(log n).',
      category: 'CS', difficulty: 'easy',
    },
    {
      id: 'fb4', question: 'Choose the correct sentence:',
      options: ['He don\'t know the answer.', 'He doesn\'t knows the answer.', 'He doesn\'t know the answer.', 'He do not knows.'], correct: 2,
      explanation: '"He doesn\'t know" is grammatically correct. Subject-verb agreement with singular "he".',
      category: 'Verbal', difficulty: 'easy',
    },
    {
      id: 'fb5', question: 'What is 15% of 240?',
      options: ['36', '34', '38', '32'], correct: 0,
      explanation: '15% of 240 = (15/100) × 240 = 36',
      category: 'Quantitative', difficulty: 'easy',
    },
    {
      id: 'fb6', question: 'Which data structure uses LIFO order?',
      options: ['Stack', 'Queue', 'Heap', 'Linked List'], correct: 0,
      explanation: 'Stack uses Last In First Out (LIFO) order.',
      category: 'CS', difficulty: 'easy',
    },
    {
      id: 'fb7', question: 'A shopkeeper sells an article at 20% profit. If cost is ₹500, find selling price.',
      options: ['₹600', '₹580', '₹620', '₹650'], correct: 0,
      explanation: 'SP = CP × (1 + profit%) = 500 × 1.20 = ₹600',
      category: 'Quantitative', difficulty: 'easy',
    },
    {
      id: 'fb8', question: 'Find the odd one out: 2, 3, 5, 7, 11, 14, 13',
      options: ['14', '11', '13', '2'], correct: 0,
      explanation: '14 is not a prime number. All others (2, 3, 5, 7, 11, 13) are prime.',
      category: 'Logical', difficulty: 'easy',
    },
    {
      id: 'fb9', question: 'What does SQL stand for?',
      options: ['Structured Query Language', 'Simple Query Language', 'Sequential Query Logic', 'Standard Query Language'], correct: 0,
      explanation: 'SQL = Structured Query Language, used for relational databases.',
      category: 'CS', difficulty: 'easy',
    },
    {
      id: 'fb10', question: 'Choose the synonym of "Ephemeral":',
      options: ['Transient', 'Eternal', 'Permanent', 'Lengthy'], correct: 0,
      explanation: '"Ephemeral" means lasting for a very short time, same as "Transient".',
      category: 'Verbal', difficulty: 'medium',
    },
  ];

  const filtered = category === 'all' ? fallbacks : fallbacks.filter(q => q.category === category);
  return filtered.slice(0, count);
}
