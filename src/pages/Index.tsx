import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ArtIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  materials: string[];
  inspiration: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  ideas?: ArtIdea[];
}

const ArtAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Привет! Я ваш персональный арт-ассистент 🎨 Опишите ваше настроение, идею или просто ключевое слово, и я предложу вам уникальные концепции для творчества!',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(true);

  const artIdeasDatabase: ArtIdea[] = [
    {
      id: '1',
      title: 'Абстрактный портрет эмоций',
      description: 'Создайте портрет, где черты лица переплетаются с цветовыми пятнами, отражающими внутренние переживания',
      category: 'Живопись',
      difficulty: 'Medium',
      materials: ['Акриловые краски', 'Холст', 'Кисти разных размеров'],
      inspiration: 'Работы Василия Кандинского и Френсиса Бэкона'
    },
    {
      id: '2',
      title: 'Городской пейзаж в дождь',
      description: 'Зафиксируйте отражения неонового света на мокром асфальте в вечернем городе',
      category: 'Фотография',
      difficulty: 'Easy',
      materials: ['Камера/смартфон', 'Штатив', 'Защита от дождя'],
      inspiration: 'Стиль киберпанк и работы Саула Лейтера'
    },
    {
      id: '3',
      title: 'Скульптура из переработанных материалов',
      description: 'Создайте произведение искусства, используя только найденные и переработанные предметы',
      category: 'Скульптура',
      difficulty: 'Hard',
      materials: ['Переработанные материалы', 'Клей', 'Инструменты для работы с металлом'],
      inspiration: 'Работы Эль Анатсуи и движение Arte Povera'
    },
    {
      id: '4',
      title: 'Минималистичный натюрморт',
      description: 'Композиция из 2-3 простых предметов с акцентом на игру света и тени',
      category: 'Живопись',
      difficulty: 'Easy',
      materials: ['Карандаши', 'Бумага', 'Простые предметы для композиции'],
      inspiration: 'Работы Джорджо Моранди'
    },
    {
      id: '5',
      title: 'Цифровой коллаж воспоминаний',
      description: 'Создайте сюрреалистичный коллаж, объединяющий личные фотографии с абстрактными элементами',
      category: 'Цифровое искусство',
      difficulty: 'Medium',
      materials: ['Графический планшет', 'Photoshop/GIMP', 'Личные фотографии'],
      inspiration: 'Работы Дэвида Хокни и Ханны Хёх'
    },
    {
      id: '6',
      title: 'Хайку в каллиграфии',
      description: 'Напишите короткое стихотворение в стиле хайку и оформите его художественной каллиграфией',
      category: 'Каллиграфия',
      difficulty: 'Medium',
      materials: ['Тушь', 'Перья', 'Качественная бумага'],
      inspiration: 'Традиционная японская каллиграфия'
    }
  ];

  const generateArtIdeasWithAI = async (prompt: string): Promise<ArtIdea[]> => {
    if (!apiKey) {
      return generateArtIdeas(prompt);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const aiPrompt = `
Ты - эксперт по искусству и творчеству. На основе запроса пользователя "${prompt}" создай 3 уникальные художественные идеи.

Для каждой идеи предоставь:
1. Название (креативное и вдохновляющее)
2. Подробное описание (2-3 предложения)
3. Категорию искусства (Живопись, Фотография, Скульптура, Цифровое искусство, Каллиграфия, Рукоделие и т.д.)
4. Уровень сложности (Easy, Medium, Hard)
5. Список материалов (3-5 предметов)
6. Источник вдохновения (художники, стили, движения)

Ответь строго в формате JSON:
{
  "ideas": [
    {
      "title": "Название",
      "description": "Описание",
      "category": "Категория",
      "difficulty": "Easy/Medium/Hard",
      "materials": ["материал1", "материал2", "материал3"],
      "inspiration": "Источник вдохновения"
    }
  ]
}
`;

      const result = await model.generateContent(aiPrompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.ideas.map((idea: any, index: number) => ({
          id: `ai_${Date.now()}_${index}`,
          ...idea
        }));
      }
    } catch (error) {
      console.error('Error generating AI ideas:', error);
    }

    return generateArtIdeas(prompt);
  };

  const generateArtIdeas = (prompt: string): ArtIdea[] => {
    const keywords = prompt.toLowerCase();
    let relevantIdeas = artIdeasDatabase;

    if (keywords.includes('грус') || keywords.includes('меланхол') || keywords.includes('печал')) {
      relevantIdeas = artIdeasDatabase.filter(idea => 
        idea.title.includes('портрет') || idea.title.includes('дождь') || idea.category === 'Живопись'
      );
    } else if (keywords.includes('город') || keywords.includes('улиц') || keywords.includes('совремеен')) {
      relevantIdeas = artIdeasDatabase.filter(idea => 
        idea.title.includes('город') || idea.category === 'Фотография'
      );
    } else if (keywords.includes('простой') || keywords.includes('минимал') || keywords.includes('начина')) {
      relevantIdeas = artIdeasDatabase.filter(idea => idea.difficulty === 'Easy');
    } else if (keywords.includes('эколог') || keywords.includes('природ') || keywords.includes('переработ')) {
      relevantIdeas = artIdeasDatabase.filter(idea => 
        idea.title.includes('переработанных') || idea.category === 'Скульптура'
      );
    }

    return relevantIdeas.slice(0, 3);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const prompt = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);

    try {
      const ideas = await generateArtIdeasWithAI(prompt);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: apiKey ? 'Вот уникальные концепции, созданные специально для вас с помощью Google Gemini AI:' : 'Отличная идея! Вот несколько концепций, которые могут вас вдохновить:',
        timestamp: new Date(),
        ideas: ideas,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Извините, произошла ошибка при генерации идей. Попробуйте еще раз.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Персональный Арт-Ассистент
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-6">
            Найдите вдохновение, создавайте уникальные произведения и развивайте свои творческие способности
          </p>
          
          {/* API Key Input */}
          {showApiInput && (
            <Card className="glass-effect border-white/20 max-w-md mx-auto mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Key" size={16} className="text-white" />
                  <span className="text-white text-sm font-medium">Google Gemini API Key (опционально)</span>
                </div>
                <div className="flex space-x-2">
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Введите API ключ для ИИ генерации"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                  />
                  <Button
                    onClick={() => setShowApiInput(false)}
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    <Icon name="Check" size={16} />
                  </Button>
                </div>
                <p className="text-white/60 text-xs mt-2">
                  Без API будут использоваться заготовленные идеи. Получить ключ: <a href="https://ai.google.dev/" target="_blank" className="underline">ai.google.dev</a>
                </p>
              </CardContent>
            </Card>
          )}
          
          {!showApiInput && apiKey && (
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Icon name="Zap" size={16} className="text-yellow-400" />
              <span className="text-white/80 text-sm">Работает на Google Gemini AI</span>
              <Button
                onClick={() => setShowApiInput(true)}
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white text-xs px-2 py-1 h-auto"
              >
                Изменить
              </Button>
            </div>
          )}
        </div>

        {/* Main Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <Card className="glass-effect border-white/20 mb-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <CardContent className="p-6">
              {/* Messages */}
              <div className="space-y-6 mb-6 max-h-96 overflow-y-auto">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className={`max-w-3xl ${
                      message.type === 'user' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-white text-gray-800'
                    } rounded-2xl p-4 shadow-lg`}>
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-white/20' 
                            : 'bg-gradient-to-r from-purple-500 to-blue-500'
                        }`}>
                          <Icon 
                            name={message.type === 'user' ? 'User' : 'Palette'} 
                            size={16} 
                            className={message.type === 'user' ? 'text-white' : 'text-white'} 
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm mb-2">{message.content}</p>
                          
                          {/* Art Ideas */}
                          {message.ideas && message.ideas.length > 0 && (
                            <div className="grid gap-4 mt-4">
                              {message.ideas.map((idea) => (
                                <Card key={idea.id} className="border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                                  <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                      <CardTitle className="text-lg text-gray-800">{idea.title}</CardTitle>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(idea.difficulty)}`}>
                                        {idea.difficulty}
                                      </span>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-gray-600 mb-3">{idea.description}</p>
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <Icon name="Tag" size={14} className="text-purple-500" />
                                        <span className="text-sm font-medium text-purple-600">{idea.category}</span>
                                      </div>
                                      <div className="flex items-start space-x-2">
                                        <Icon name="Package" size={14} className="text-blue-500 mt-0.5" />
                                        <span className="text-sm text-gray-600">{idea.materials.join(', ')}</span>
                                      </div>
                                      <div className="flex items-start space-x-2">
                                        <Icon name="Lightbulb" size={14} className="text-yellow-500 mt-0.5" />
                                        <span className="text-sm text-gray-600">{idea.inspiration}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isGenerating && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-white rounded-2xl p-4 shadow-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center animate-pulse-glow">
                          <Icon name="Palette" size={16} className="text-white" />
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex space-x-4">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Опишите ваше настроение, идею или просто ключевое слово..."
                  className="flex-1 min-h-[60px] bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isGenerating}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20 px-6 transition-all duration-300 hover:scale-105"
                >
                  <Icon name="Send" size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
            {[
              { icon: 'Brush', title: 'Живопись', desc: 'Идеи для картин и рисунков' },
              { icon: 'Camera', title: 'Фотография', desc: 'Концепции для съемки' },
              { icon: 'Scissors', title: 'Рукоделие', desc: 'Поделки и hand-made' }
            ].map((action, index) => (
              <Card 
                key={action.title}
                className="glass-effect border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => setInputValue(action.title.toLowerCase())}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon name={action.icon as any} size={24} className="text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">{action.title}</h3>
                  <p className="text-white/70 text-sm">{action.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtAssistant;