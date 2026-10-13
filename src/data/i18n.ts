/**
 * Interface translations.
 *
 * Scope is deliberate: navigation, the language control, and the homepage
 * introduction are translated into every language below. Biographies, book
 * pages, and argument maps remain in English; for those, the language menu
 * offers whole-page machine translation (clearly labelled as such). Extending
 * coverage means adding a key to KEYS and one string per language, in order.
 * `scripts/test-i18n.mjs` fails the build if any language is missing a string.
 */

export const KEYS = [
  'nav.explore', 'nav.scientists', 'nav.mathematicians', 'nav.books', 'nav.philosophy',
  'nav.ideas', 'nav.topics', 'nav.laboratory', 'nav.paths', 'lang.reading',
  'home.eyebrow', 'home.t1', 'home.t2', 'home.lede', 'home.cta1', 'home.cta2', 'home.note',
  'home.pick', 'home.pickTitle', 'door.science', 'door.math', 'door.philosophy', 'door.lab',
  'nav.collection',
] as const;

export type Key = (typeof KEYS)[number];

export interface Language {
  code: string;
  /** Name in the language itself. */
  native: string;
  /** English name. */
  english: string;
  rtl?: boolean;
  /** Code Google Translate expects, where it differs. */
  google?: string;
}

export const LANGUAGES: Language[] = [
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
  { code: 'gu', native: 'ગુજરાતી', english: 'Gujarati' },
  { code: 'ur', native: 'اردو', english: 'Urdu', rtl: true },
  { code: 'es', native: 'Español', english: 'Spanish' },
  { code: 'fr', native: 'Français', english: 'French' },
  { code: 'de', native: 'Deutsch', english: 'German' },
  { code: 'pt', native: 'Português', english: 'Portuguese' },
  { code: 'it', native: 'Italiano', english: 'Italian' },
  { code: 'ar', native: 'العربية', english: 'Arabic', rtl: true },
  { code: 'fa', native: 'فارسی', english: 'Persian', rtl: true },
  { code: 'tr', native: 'Türkçe', english: 'Turkish' },
  { code: 'ru', native: 'Русский', english: 'Russian' },
  { code: 'zh', native: '中文', english: 'Chinese', google: 'zh-CN' },
  { code: 'ja', native: '日本語', english: 'Japanese' },
  { code: 'ko', native: '한국어', english: 'Korean' },
  { code: 'id', native: 'Bahasa Indonesia', english: 'Indonesian' },
  { code: 'sw', native: 'Kiswahili', english: 'Swahili' },
];

/** One array per language, in KEYS order. */
export const STRINGS: Record<string, string[]> = {
  hi: ['खोजें', 'वैज्ञानिक', 'गणितज्ञ', 'पुस्तकें', 'दर्शन', 'विचार', 'विषय', 'प्रयोगशाला', 'सीखने के रास्ते', 'पढ़ने की भाषा',
    'मानवीय जिज्ञासा की एक मार्गदर्शिका', 'बड़े सवाल।', 'नए नज़रिए।', 'दुनिया को समझिए। अपनी धारणाओं पर सवाल उठाइए। विज्ञान, गणित और दर्शन के पीछे के दिमागों से मिलिए, फिर उनके विचारों को खुद आज़माइए।', 'संग्रह खोजें', 'शुरुआत का बिंदु खोजें', 'स्रोतों वाली कहानियाँ। खेलने लायक विचार। असहमति की गुंजाइश।',
    'एक दिशा चुनिए', 'एक जिज्ञासा। भीतर आने के कई रास्ते।', 'दुनिया को समझिए।', 'जानिए क्या सच होना ही चाहिए।', 'जो जानते हैं उस पर सवाल उठाइए।', 'खुद करके देखिए।', 'आपका संग्रह'],
  bn: ['অন্বেষণ', 'বিজ্ঞানী', 'গণিতবিদ', 'বই', 'দর্শন', 'ভাবনা', 'বিষয়', 'পরীক্ষাগার', 'শেখার পথ', 'পড়ার ভাষা',
    'মানুষের কৌতূহলের একটি পথনির্দেশিকা', 'বড় প্রশ্ন।', 'নতুন দৃষ্টিভঙ্গি।', 'পৃথিবীকে বুঝুন। নিজের ধারণাকে প্রশ্ন করুন। বিজ্ঞান, গণিত ও দর্শনের পেছনের মনীষীদের সঙ্গে পরিচিত হন, তারপর তাঁদের ভাবনা নিজে যাচাই করুন।', 'সংগ্রহ ঘুরে দেখুন', 'শুরুর জায়গা খুঁজুন', 'উৎসসহ গল্প। খেলার মতো ভাবনা। দ্বিমতের জায়গা।',
    'একটি দিক বেছে নিন', 'একটি কৌতূহল। প্রবেশের অনেক পথ।', 'পৃথিবীকে বুঝুন।', 'কী সত্য হতে বাধ্য তা খুঁজে দেখুন।', 'যা জানেন তাকে প্রশ্ন করুন।', 'নিজে করে দেখুন।', 'আপনার সংগ্রহ'],
  ta: ['ஆராயுங்கள்', 'அறிவியலாளர்கள்', 'கணிதவியலாளர்கள்', 'நூல்கள்', 'தத்துவம்', 'கருத்துகள்', 'தலைப்புகள்', 'ஆய்வகம்', 'கற்றல் பாதைகள்', 'படிக்கும் மொழி',
    'மனித ஆர்வத்துக்கான ஒரு வழிகாட்டி', 'பெரிய கேள்விகள்.', 'புதிய பார்வைகள்.', 'உலகைப் புரிந்துகொள்ளுங்கள். உங்கள் அனுமானங்களைக் கேள்வி கேளுங்கள். அறிவியல், கணிதம், தத்துவத்தின் பின்னுள்ள சிந்தனையாளர்களைச் சந்தியுங்கள்; பிறகு அவர்களின் கருத்துகளை நீங்களே சோதித்துப் பாருங்கள்.', 'தொகுப்பை ஆராயுங்கள்', 'தொடக்கப் புள்ளியைக் கண்டறியுங்கள்', 'ஆதாரங்களுடன் கதைகள். விளையாடிப் பார்க்கக்கூடிய கருத்துகள். கருத்து வேறுபாட்டுக்கு இடம்.',
    'ஒரு திசையைத் தேர்ந்தெடுங்கள்', 'ஒரு ஆர்வம். உள்ளே நுழைய பல வழிகள்.', 'உலகைப் புரிந்துகொள்ளுங்கள்.', 'எது உண்மையாக இருக்க வேண்டும் என்பதைக் கண்டறியுங்கள்.', 'நீங்கள் அறிந்ததைக் கேள்வி கேளுங்கள்.', 'நீங்களே செய்து பாருங்கள்.', 'உங்கள் தொகுப்பு'],
  te: ['అన్వేషించండి', 'శాస్త్రవేత్తలు', 'గణిత శాస్త్రవేత్తలు', 'పుస్తకాలు', 'తత్వశాస్త్రం', 'ఆలోచనలు', 'అంశాలు', 'ప్రయోగశాల', 'నేర్చుకునే మార్గాలు', 'చదివే భాష',
    'మానవ జిజ్ఞాసకు ఒక మార్గదర్శి', 'పెద్ద ప్రశ్నలు.', 'కొత్త దృక్కోణాలు.', 'ప్రపంచాన్ని అర్థం చేసుకోండి. మీ అంచనాలను ప్రశ్నించండి. సైన్స్, గణితం, తత్వశాస్త్రం వెనుక ఉన్న మేధావులను కలవండి, ఆపై వారి ఆలోచనలను మీరే ప్రయత్నించండి.', 'సంగ్రహాన్ని అన్వేషించండి', 'ప్రారంభ స్థానాన్ని కనుగొనండి', 'ఆధారాలతో కథలు. ఆడి చూడగల ఆలోచనలు. భిన్నాభిప్రాయానికి చోటు.',
    'ఒక దిశను ఎంచుకోండి', 'ఒక జిజ్ఞాస. లోపలికి అనేక దారులు.', 'ప్రపంచాన్ని అర్థం చేసుకోండి.', 'ఏది నిజమై తీరాలో తెలుసుకోండి.', 'మీకు తెలిసిన దాన్ని ప్రశ్నించండి.', 'మీరే చేసి చూడండి.', 'మీ సేకరణ'],
  mr: ['शोधा', 'शास्त्रज्ञ', 'गणितज्ञ', 'पुस्तके', 'तत्त्वज्ञान', 'विचार', 'विषय', 'प्रयोगशाळा', 'शिकण्याचे मार्ग', 'वाचनाची भाषा',
    'मानवी जिज्ञासेची मार्गदर्शिका', 'मोठे प्रश्न.', 'नवे दृष्टिकोन.', 'जग समजून घ्या. आपल्या गृहितकांना प्रश्न विचारा. विज्ञान, गणित आणि तत्त्वज्ञानामागील विचारवंतांना भेटा, मग त्यांच्या कल्पना स्वतः आजमावून पहा.', 'संग्रह शोधा', 'सुरुवातीचा बिंदू शोधा', 'स्रोतांसह कथा. खेळून पाहता येतील अशा कल्पना. मतभेदांना जागा.',
    'एक दिशा निवडा', 'एक जिज्ञासा. आत येण्याचे अनेक मार्ग.', 'जग समजून घ्या.', 'काय खरे असलेच पाहिजे ते शोधा.', 'तुम्हाला जे माहीत आहे त्यावर प्रश्न विचारा.', 'स्वतः करून पहा.', 'तुमचा संग्रह'],
  gu: ['શોધો', 'વૈજ્ઞાનિકો', 'ગણિતશાસ્ત્રીઓ', 'પુસ્તકો', 'તત્ત્વજ્ઞાન', 'વિચારો', 'વિષયો', 'પ્રયોગશાળા', 'શીખવાના માર્ગો', 'વાંચવાની ભાષા',
    'માનવ જિજ્ઞાસાની માર્ગદર્શિકા', 'મોટા પ્રશ્નો.', 'નવા દૃષ્ટિકોણ.', 'દુનિયાને સમજો. તમારી ધારણાઓ પર પ્રશ્ન કરો. વિજ્ઞાન, ગણિત અને તત્ત્વજ્ઞાન પાછળના વિચારકોને મળો, પછી તેમના વિચારો જાતે અજમાવો.', 'સંગ્રહ શોધો', 'શરૂઆતનો બિંદુ શોધો', 'સ્રોત સાથેની કથાઓ. અજમાવી શકાય તેવા વિચારો. મતભેદ માટે જગ્યા.',
    'એક દિશા પસંદ કરો', 'એક જિજ્ઞાસા. અંદર આવવાના ઘણા માર્ગ.', 'દુનિયાને સમજો.', 'શું સાચું હોવું જ જોઈએ તે શોધો.', 'તમે જે જાણો છો તેના પર પ્રશ્ન કરો.', 'જાતે કરીને જુઓ.', 'તમારો સંગ્રહ'],
  ur: ['دریافت کریں', 'سائنسدان', 'ریاضی دان', 'کتابیں', 'فلسفہ', 'خیالات', 'موضوعات', 'تجربہ گاہ', 'سیکھنے کے راستے', 'پڑھنے کی زبان',
    'انسانی تجسس کی ایک رہنما کتاب', 'بڑے سوال۔', 'نئے زاویے۔', 'دنیا کو سمجھیے۔ اپنے مفروضوں پر سوال اٹھائیے۔ سائنس، ریاضی اور فلسفے کے پیچھے موجود ذہنوں سے ملیے، پھر ان کے خیالات خود آزمائیے۔', 'ذخیرہ دریافت کریں', 'آغاز کا نقطہ تلاش کریں', 'حوالوں کے ساتھ کہانیاں۔ آزمانے لائق خیالات۔ اختلاف کی گنجائش۔',
    'ایک سمت چنیے', 'ایک تجسس۔ اندر آنے کے کئی راستے۔', 'دنیا کو سمجھیے۔', 'جانیے کہ کیا سچ ہونا ہی چاہیے۔', 'جو آپ جانتے ہیں اس پر سوال اٹھائیے۔', 'خود کر کے دیکھیے۔', 'آپ کا ذخیرہ'],
  es: ['Explorar', 'Científicos', 'Matemáticos', 'Libros', 'Filosofía', 'Ideas', 'Temas', 'Laboratorio', 'Rutas', 'Idioma de lectura',
    'Una guía de campo de la curiosidad humana', 'Grandes preguntas.', 'Perspectivas más claras.', 'Comprende el mundo. Cuestiona tus supuestos. Conoce a las mentes detrás de la ciencia, las matemáticas y la filosofía, y luego prueba sus ideas por ti mismo.', 'Explorar el archivo', 'Encontrar un punto de partida', 'Historias con fuentes. Ideas con las que jugar. Espacio para el desacuerdo.',
    'Elige una dirección', 'Una curiosidad. Muchas formas de entrar.', 'Comprende el mundo.', 'Descubre lo que tiene que ser verdad.', 'Cuestiona lo que sabes.', 'Compruébalo por ti mismo.', 'Tu colección'],
  fr: ['Explorer', 'Scientifiques', 'Mathématiciens', 'Livres', 'Philosophie', 'Idées', 'Thèmes', 'Laboratoire', 'Parcours', 'Langue de lecture',
    'Un guide de terrain de la curiosité humaine', 'De grandes questions.', 'De nouvelles perspectives.', 'Comprenez le monde. Remettez en question vos certitudes. Rencontrez les esprits derrière la science, les mathématiques et la philosophie, puis mettez leurs idées à l’épreuve vous-même.', 'Explorer les archives', 'Trouver un point de départ', 'Des récits sourcés. Des idées à manipuler. De la place pour le désaccord.',
    'Choisissez une direction', 'Une curiosité. Mille façons d’entrer.', 'Comprendre le monde.', 'Découvrir ce qui doit être vrai.', 'Questionner ce que vous savez.', 'Vérifier par vous-même.', 'Votre collection'],
  de: ['Entdecken', 'Wissenschaftler', 'Mathematiker', 'Bücher', 'Philosophie', 'Ideen', 'Themen', 'Labor', 'Lernpfade', 'Lesesprache',
    'Ein Feldführer durch die menschliche Neugier', 'Große Fragen.', 'Neue Perspektiven.', 'Verstehe die Welt. Hinterfrage deine Annahmen. Lerne die Köpfe hinter Wissenschaft, Mathematik und Philosophie kennen und probiere ihre Ideen selbst aus.', 'Archiv erkunden', 'Einen Startpunkt finden', 'Belegte Geschichten. Ideen zum Ausprobieren. Raum für Widerspruch.',
    'Wähle eine Richtung', 'Eine Neugier. Viele Wege hinein.', 'Die Welt verstehen.', 'Herausfinden, was wahr sein muss.', 'Hinterfrage, was du weißt.', 'Selbst herausfinden.', 'Deine Sammlung'],
  pt: ['Explorar', 'Cientistas', 'Matemáticos', 'Livros', 'Filosofia', 'Ideias', 'Temas', 'Laboratório', 'Trilhas', 'Idioma de leitura',
    'Um guia de campo da curiosidade humana', 'Grandes perguntas.', 'Perspectivas mais claras.', 'Entenda o mundo. Questione suas suposições. Conheça as mentes por trás da ciência, da matemática e da filosofia e depois teste as ideias delas por conta própria.', 'Explorar o acervo', 'Encontrar um ponto de partida', 'Histórias com fontes. Ideias para experimentar. Espaço para discordar.',
    'Escolha uma direção', 'Uma curiosidade. Muitas formas de entrar.', 'Entenda o mundo.', 'Descubra o que tem de ser verdade.', 'Questione o que você sabe.', 'Descubra por si mesmo.', 'Sua coleção'],
  it: ['Esplora', 'Scienziati', 'Matematici', 'Libri', 'Filosofia', 'Idee', 'Temi', 'Laboratorio', 'Percorsi', 'Lingua di lettura',
    'Una guida sul campo alla curiosità umana', 'Grandi domande.', 'Nuove prospettive.', 'Comprendi il mondo. Metti in discussione le tue certezze. Incontra le menti dietro la scienza, la matematica e la filosofia, poi metti alla prova le loro idee.', 'Esplora l’archivio', 'Trova un punto di partenza', 'Storie documentate. Idee con cui giocare. Spazio per il disaccordo.',
    'Scegli una direzione', 'Una curiosità. Molti modi per entrare.', 'Comprendi il mondo.', 'Scopri ciò che deve essere vero.', 'Metti in dubbio ciò che sai.', 'Scoprilo da solo.', 'La tua collezione'],
  ar: ['استكشف', 'العلماء', 'علماء الرياضيات', 'الكتب', 'الفلسفة', 'الأفكار', 'المواضيع', 'المختبر', 'مسارات التعلّم', 'لغة القراءة',
    'دليل ميداني للفضول الإنساني', 'أسئلة كبيرة.', 'آفاق أرحب.', 'افهم العالم. اسأل عن افتراضاتك. تعرّف على العقول التي تقف وراء العلم والرياضيات والفلسفة، ثم جرّب أفكارهم بنفسك.', 'استكشف الأرشيف', 'اعثر على نقطة بداية', 'قصص موثّقة بالمصادر. أفكار يمكن تجربتها. مساحة للاختلاف.',
    'اختر اتجاهًا', 'فضول واحد. طرق كثيرة للدخول.', 'افهم العالم.', 'اكتشف ما يجب أن يكون صحيحًا.', 'اسأل عمّا تعرفه.', 'اكتشف بنفسك.', 'مجموعتك'],
  fa: ['کاوش', 'دانشمندان', 'ریاضی‌دانان', 'کتاب‌ها', 'فلسفه', 'اندیشه‌ها', 'موضوع‌ها', 'آزمایشگاه', 'مسیرهای یادگیری', 'زبان مطالعه',
    'راهنمای میدانی کنجکاوی انسان', 'پرسش‌های بزرگ.', 'دیدگاه‌های تازه.', 'جهان را بفهمید. پیش‌فرض‌های خود را به پرسش بگیرید. با ذهن‌های پشت علم، ریاضیات و فلسفه آشنا شوید و سپس اندیشه‌هایشان را خودتان بیازمایید.', 'کاوش در آرشیو', 'نقطهٔ شروع را پیدا کنید', 'روایت‌های مستند. اندیشه‌هایی برای آزمودن. جایی برای مخالفت.',
    'یک جهت را برگزینید', 'یک کنجکاوی. راه‌های بسیار برای ورود.', 'جهان را بفهمید.', 'بیابید چه چیزی باید درست باشد.', 'آنچه می‌دانید را به پرسش بگیرید.', 'خودتان امتحان کنید.', 'مجموعهٔ شما'],
  tr: ['Keşfet', 'Bilim insanları', 'Matematikçiler', 'Kitaplar', 'Felsefe', 'Fikirler', 'Konular', 'Laboratuvar', 'Öğrenme yolları', 'Okuma dili',
    'İnsan merakı için bir saha rehberi', 'Büyük sorular.', 'Daha parlak bakış açıları.', 'Dünyayı anlayın. Varsayımlarınızı sorgulayın. Bilimin, matematiğin ve felsefenin ardındaki zihinlerle tanışın, sonra fikirlerini kendiniz deneyin.', 'Arşivi keşfet', 'Bir başlangıç noktası bul', 'Kaynaklı hikâyeler. Denenebilir fikirler. Anlaşmazlığa yer.',
    'Bir yön seçin', 'Tek bir merak. Girmenin birçok yolu.', 'Dünyayı anlayın.', 'Doğru olmak zorunda olanı bulun.', 'Bildiğinizi sorgulayın.', 'Kendiniz deneyin.', 'Koleksiyonunuz'],
  ru: ['Обзор', 'Учёные', 'Математики', 'Книги', 'Философия', 'Идеи', 'Темы', 'Лаборатория', 'Маршруты', 'Язык чтения',
    'Путеводитель по человеческому любопытству', 'Большие вопросы.', 'Новые взгляды.', 'Поймите мир. Усомнитесь в своих допущениях. Познакомьтесь с умами, стоящими за наукой, математикой и философией, а затем проверьте их идеи сами.', 'Исследовать архив', 'Найти отправную точку', 'Истории с источниками. Идеи, которые можно опробовать. Место для несогласия.',
    'Выберите направление', 'Одно любопытство. Много путей внутрь.', 'Поймите мир.', 'Узнайте, что должно быть истинным.', 'Усомнитесь в том, что знаете.', 'Проверьте сами.', 'Ваша коллекция'],
  zh: ['探索', '科学家', '数学家', '书籍', '哲学', '思想', '专题', '实验室', '学习路径', '阅读语言',
    '人类好奇心的实地指南', '大问题。', '新视角。', '理解世界，质疑自己的假设。认识科学、数学与哲学背后的思想者，然后亲自检验他们的想法。', '探索档案', '找到起点', '有来源的故事。可动手尝试的思想。为分歧留出空间。',
    '选择一个方向', '一份好奇心，多种入口。', '理解世界。', '找出什么必然为真。', '质疑你所知道的。', '亲自去验证。', '你的收藏'],
  ja: ['探る', '科学者', '数学者', '本', '哲学', 'アイデア', 'トピック', '実験室', '学びの道', '読む言語',
    '人間の好奇心へのフィールドガイド', '大きな問い。', '新しい視点。', '世界を理解し、前提を疑い、科学・数学・哲学を築いた人々に出会い、その考えを自分で試してみましょう。', 'アーカイブを探る', '出発点を見つける', '出典のある物語。試せるアイデア。異論の余地。',
    '方向を選ぶ', 'ひとつの好奇心、たくさんの入口。', '世界を理解する。', '真でなければならないことを探る。', '知っていることを問い直す。', '自分で確かめる。', 'あなたのコレクション'],
  ko: ['탐색', '과학자', '수학자', '책', '철학', '아이디어', '주제', '실험실', '학습 경로', '읽기 언어',
    '인간의 호기심을 위한 현장 안내서', '큰 질문들.', '더 밝은 관점.', '세상을 이해하세요. 당신의 가정을 의심해 보세요. 과학, 수학, 철학 뒤의 사상가들을 만나고 그들의 생각을 직접 시험해 보세요.', '아카이브 탐색', '시작점 찾기', '출처가 있는 이야기. 직접 해볼 수 있는 아이디어. 이견을 위한 여지.',
    '방향을 고르세요', '하나의 호기심, 여러 갈래의 입구.', '세상을 이해하기.', '무엇이 참이어야 하는지 알아보기.', '당신이 아는 것을 되묻기.', '직접 확인하기.', '내 컬렉션'],
  id: ['Jelajahi', 'Ilmuwan', 'Matematikawan', 'Buku', 'Filsafat', 'Gagasan', 'Topik', 'Laboratorium', 'Jalur belajar', 'Bahasa baca',
    'Panduan lapangan untuk rasa ingin tahu manusia', 'Pertanyaan besar.', 'Sudut pandang yang lebih terang.', 'Pahami dunia. Pertanyakan asumsi Anda. Kenali para pemikir di balik sains, matematika, dan filsafat, lalu coba sendiri gagasan mereka.', 'Jelajahi arsip', 'Temukan titik awal', 'Kisah bersumber. Gagasan yang bisa dicoba. Ruang untuk berbeda pendapat.',
    'Pilih arah', 'Satu rasa ingin tahu. Banyak jalan masuk.', 'Pahami dunia.', 'Temukan apa yang pasti benar.', 'Pertanyakan apa yang Anda ketahui.', 'Buktikan sendiri.', 'Koleksi Anda'],
  sw: ['Gundua', 'Wanasayansi', 'Wanahisabati', 'Vitabu', 'Falsafa', 'Mawazo', 'Mada', 'Maabara', 'Njia za kujifunza', 'Lugha ya kusoma',
    'Mwongozo wa udadisi wa binadamu', 'Maswali makubwa.', 'Mitazamo angavu zaidi.', 'Elewa ulimwengu. Hoji dhana zako. Kutana na akili nyuma ya sayansi, hisabati na falsafa, kisha jaribu mawazo yao mwenyewe.', 'Gundua hifadhi', 'Tafuta mahali pa kuanzia', 'Hadithi zenye vyanzo. Mawazo ya kujaribu. Nafasi ya kutokubaliana.',
    'Chagua mwelekeo', 'Udadisi mmoja. Njia nyingi za kuingia.', 'Elewa ulimwengu.', 'Gundua kinachopaswa kuwa kweli.', 'Hoji unachojua.', 'Jaribu mwenyewe.', 'Mkusanyiko wako'],
};
