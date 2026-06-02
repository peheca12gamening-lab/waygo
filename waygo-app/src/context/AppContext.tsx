import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ── Translations ──────────────────────────────────────────────────────────────
export const TRANSLATIONS = {
  en: {
    map: 'Map', quests: 'Quests', forYou: 'For You', profile: 'Profile', top: 'Top',
    searchPlaces: 'Search places in Plovdiv...',
    startRoute: '🧭 Start Route', close: 'Close', more: 'More',
    settings: 'Settings', myPoints: 'My Points', redeemedRewards: 'Redeemed Rewards',
    visitHistory: 'Visit History', changeEmail: 'Change Email', language: 'Language',
    darkMode: 'Dark Mode', lightMode: 'Light Mode', logout: 'Logout',
    friends: 'Friends', badges: 'Badges', checkIns: 'Check-ins', points: 'Points',
    addFriend: 'Add Friend', saveAvatar: 'Save Avatar', uploadPhoto: 'Upload Photo',
    navigating: 'Navigating…', youveArrived: "You've arrived!", takePhoto: 'Take a Photo',
    reviewPhoto: 'Review your photo', retakePhoto: 'Retake Photo',
    uploadAndEarn: 'Upload & Earn', saveWithout: 'Save without uploading',
    checkInComplete: 'Check-in Complete!', earned: 'Points earned!',
    forYouTitle: 'For You', explorers: 'Recent check-ins from explorers 🌍',
    createAccount: 'Create Account', login: 'Login', alreadyHave: 'Already have an account?',
    loginHere: 'Login from here', noAccount: "Don't have an account?", createHere: 'Create one here',
    friendRequests: 'Friend Requests', myFriends: 'My Friends', accept: 'Accept', decline: 'Decline',
    noFriends: 'No friends yet. Add some from the map!',
    badgeDetails: 'Badge Details', progress: 'Progress', howToEarn: 'How to earn',
    currentlyDark: 'Currently dark', currentlyLight: 'Currently light',
    searchByName: 'Search by name…', search: 'Search', added: '✅ Added', add: '+ Add',
    pointsAvailable: 'points available', recentEarnings: 'Recent earnings',
    howToEarnPoints: 'How to earn points', plovdivExplored: 'Plovdiv Explored',
    recentVisits: 'Recent Visits', seeAll: 'See all →',
    noVisits: 'No check-ins yet. Start exploring!', noPoints: 'No points earned yet. Visit a museum!',
    chooseAvatar: 'Choose Avatar', explorerParrots: 'Explorer Parrots', orUpload: 'Or upload your own',
    wantsToFriend: 'Wants to be your friend',
    cameraError: 'Camera access denied. Please allow camera permissions.', tryAgain: 'Try Again',
    flipCamera: 'Flip', livePhotoOnly: '📵 Upload not allowed — live photo only',
    photosCaptured: '✅ Photo captured!', confirmPhoto: 'Confirm',
  },
  bg: {
    map: 'Карта', quests: 'Задачи', forYou: 'За теб', profile: 'Профил', top: 'Топ',
    searchPlaces: 'Търси места в Пловдив...',
    startRoute: '🧭 Стартирай маршрут', close: 'Затвори', more: 'Още',
    settings: 'Настройки', myPoints: 'Моите точки', redeemedRewards: 'Използвани награди',
    visitHistory: 'История на посещенията', changeEmail: 'Смени имейл', language: 'Език',
    darkMode: 'Тъмен режим', lightMode: 'Светъл режим', logout: 'Изход',
    friends: 'Приятели', badges: 'Значки', checkIns: 'Посещения', points: 'Точки',
    addFriend: 'Добави приятел', saveAvatar: 'Запази аватар', uploadPhoto: 'Качи снимка',
    navigating: 'Навигиране…', youveArrived: 'Пристигна!', takePhoto: 'Направи снимка',
    reviewPhoto: 'Прегледай снимката', retakePhoto: 'Направи отново',
    uploadAndEarn: 'Качи и спечели', saveWithout: 'Запази без качване',
    checkInComplete: 'Посещението е записано!', earned: 'Точки спечелени!',
    forYouTitle: 'За теб', explorers: 'Последни посещения от изследователи 🌍',
    createAccount: 'Създай акаунт', login: 'Вход', alreadyHave: 'Вече имаш акаунт?',
    loginHere: 'Влез от тук', noAccount: 'Нямаш акаунт?', createHere: 'Създай от тук',
    friendRequests: 'Заявки за приятелство', myFriends: 'Моите приятели', accept: 'Приеми', decline: 'Откажи',
    noFriends: 'Няма приятели. Добави от картата!',
    badgeDetails: 'Детайли за значката', progress: 'Напредък', howToEarn: 'Как да спечелиш',
    currentlyDark: 'Тъмен сега', currentlyLight: 'Светъл сега',
    searchByName: 'Търси по име…', search: 'Търси', added: '✅ Добавен', add: '+ Добави',
    pointsAvailable: 'налични точки', recentEarnings: 'Последни спечелени',
    howToEarnPoints: 'Как да спечелиш точки', plovdivExplored: 'Пловдив изследван',
    recentVisits: 'Последни посещения', seeAll: 'Виж всички →',
    noVisits: 'Няма посещения. Изследвай!', noPoints: 'Няма точки. Посети музей!',
    chooseAvatar: 'Избери аватар', explorerParrots: 'Изследователски папагали', orUpload: 'Или качи своя',
    wantsToFriend: 'Иска да стане твой приятел',
    cameraError: 'Достъпът до камерата е отказан.', tryAgain: 'Опитай отново',
    flipCamera: 'Обърни', livePhotoOnly: '📵 Само снимка на живо',
    photosCaptured: '✅ Снимката е направена!', confirmPhoto: 'Потвърди',
  },
  de: {
    map: 'Karte', quests: 'Quests', forYou: 'Für dich', profile: 'Profil', top: 'Top',
    searchPlaces: 'Orte in Plovdiv suchen...',
    startRoute: '🧭 Route starten', close: 'Schließen', more: 'Mehr',
    settings: 'Einstellungen', myPoints: 'Meine Punkte', redeemedRewards: 'Eingelöste Belohnungen',
    visitHistory: 'Besuchsverlauf', changeEmail: 'E-Mail ändern', language: 'Sprache',
    darkMode: 'Dunkelmodus', lightMode: 'Hellmodus', logout: 'Abmelden',
    friends: 'Freunde', badges: 'Abzeichen', checkIns: 'Check-ins', points: 'Punkte',
    addFriend: 'Freund hinzufügen', saveAvatar: 'Avatar speichern', uploadPhoto: 'Foto hochladen',
    navigating: 'Navigation…', youveArrived: 'Angekommen!', takePhoto: 'Foto aufnehmen',
    reviewPhoto: 'Foto überprüfen', retakePhoto: 'Erneut aufnehmen',
    uploadAndEarn: 'Hochladen & verdienen', saveWithout: 'Ohne Hochladen speichern',
    checkInComplete: 'Check-in abgeschlossen!', earned: 'Punkte verdient!',
    forYouTitle: 'Für dich', explorers: 'Aktuelle Check-ins von Entdeckern 🌍',
    createAccount: 'Konto erstellen', login: 'Anmelden', alreadyHave: 'Bereits ein Konto?',
    loginHere: 'Hier anmelden', noAccount: 'Kein Konto?', createHere: 'Hier erstellen',
    friendRequests: 'Freundschaftsanfragen', myFriends: 'Meine Freunde', accept: 'Annehmen', decline: 'Ablehnen',
    noFriends: 'Keine Freunde. Füge welche von der Karte hinzu!',
    badgeDetails: 'Abzeichen-Details', progress: 'Fortschritt', howToEarn: 'So verdienst du',
    currentlyDark: 'Aktuell dunkel', currentlyLight: 'Aktuell hell',
    searchByName: 'Nach Name suchen…', search: 'Suchen', added: '✅ Hinzugefügt', add: '+ Hinzufügen',
    pointsAvailable: 'Punkte verfügbar', recentEarnings: 'Kürzlich verdient',
    howToEarnPoints: 'Wie man Punkte verdient', plovdivExplored: 'Plovdiv erkundet',
    recentVisits: 'Letzte Besuche', seeAll: 'Alle anzeigen →',
    noVisits: 'Keine Check-ins. Erkunde!', noPoints: 'Keine Punkte. Besuche ein Museum!',
    chooseAvatar: 'Avatar wählen', explorerParrots: 'Entdecker-Papageien', orUpload: 'Oder eigenes hochladen',
    wantsToFriend: 'Möchte dein Freund sein',
    cameraError: 'Kamerazugriff verweigert.', tryAgain: 'Erneut versuchen',
    flipCamera: 'Wenden', livePhotoOnly: '📵 Nur Live-Fotos erlaubt',
    photosCaptured: '✅ Foto aufgenommen!', confirmPhoto: 'Bestätigen',
  },
  fr: {
    map: 'Carte', quests: 'Quêtes', forYou: 'Pour toi', profile: 'Profil', top: 'Top',
    searchPlaces: 'Chercher des lieux à Plovdiv...',
    startRoute: '🧭 Démarrer l\'itinéraire', close: 'Fermer', more: 'Plus',
    settings: 'Paramètres', myPoints: 'Mes points', redeemedRewards: 'Récompenses utilisées',
    visitHistory: 'Historique des visites', changeEmail: 'Changer l\'email', language: 'Langue',
    darkMode: 'Mode sombre', lightMode: 'Mode clair', logout: 'Déconnexion',
    friends: 'Amis', badges: 'Badges', checkIns: 'Check-ins', points: 'Points',
    addFriend: 'Ajouter un ami', saveAvatar: 'Enregistrer l\'avatar', uploadPhoto: 'Télécharger une photo',
    navigating: 'Navigation…', youveArrived: 'Vous êtes arrivé!', takePhoto: 'Prendre une photo',
    reviewPhoto: 'Vérifier la photo', retakePhoto: 'Reprendre la photo',
    uploadAndEarn: 'Télécharger et gagner', saveWithout: 'Enregistrer sans télécharger',
    checkInComplete: 'Check-in terminé!', earned: 'Points gagnés!',
    forYouTitle: 'Pour toi', explorers: 'Derniers check-ins des explorateurs 🌍',
    createAccount: 'Créer un compte', login: 'Connexion', alreadyHave: 'Déjà un compte?',
    loginHere: 'Se connecter ici', noAccount: 'Pas de compte?', createHere: 'Créer ici',
    friendRequests: 'Demandes d\'amis', myFriends: 'Mes amis', accept: 'Accepter', decline: 'Refuser',
    noFriends: 'Pas d\'amis. Ajoutez-en depuis la carte!',
    badgeDetails: 'Détails du badge', progress: 'Progression', howToEarn: 'Comment gagner',
    currentlyDark: 'Mode sombre actif', currentlyLight: 'Mode clair actif',
    searchByName: 'Chercher par nom…', search: 'Rechercher', added: '✅ Ajouté', add: '+ Ajouter',
    pointsAvailable: 'points disponibles', recentEarnings: 'Gains récents',
    howToEarnPoints: 'Comment gagner des points', plovdivExplored: 'Plovdiv exploré',
    recentVisits: 'Visites récentes', seeAll: 'Tout voir →',
    noVisits: 'Pas de check-ins. Explorez!', noPoints: 'Pas de points. Visitez un musée!',
    chooseAvatar: 'Choisir un avatar', explorerParrots: 'Perroquets explorateurs', orUpload: 'Ou télécharger le vôtre',
    wantsToFriend: 'Veut être votre ami',
    cameraError: 'Accès à la caméra refusé.', tryAgain: 'Réessayer',
    flipCamera: 'Retourner', livePhotoOnly: '📵 Photo en direct uniquement',
    photosCaptured: '✅ Photo prise!', confirmPhoto: 'Confirmer',
  },
  es: {
    map: 'Mapa', quests: 'Quests', forYou: 'Para ti', profile: 'Perfil', top: 'Top',
    searchPlaces: 'Buscar lugares en Plovdiv...',
    startRoute: '🧭 Iniciar ruta', close: 'Cerrar', more: 'Más',
    settings: 'Ajustes', myPoints: 'Mis puntos', redeemedRewards: 'Recompensas canjeadas',
    visitHistory: 'Historial de visitas', changeEmail: 'Cambiar email', language: 'Idioma',
    darkMode: 'Modo oscuro', lightMode: 'Modo claro', logout: 'Cerrar sesión',
    friends: 'Amigos', badges: 'Insignias', checkIns: 'Check-ins', points: 'Puntos',
    addFriend: 'Agregar amigo', saveAvatar: 'Guardar avatar', uploadPhoto: 'Subir foto',
    navigating: 'Navegando…', youveArrived: '¡Has llegado!', takePhoto: 'Tomar foto',
    reviewPhoto: 'Revisar foto', retakePhoto: 'Retomar foto',
    uploadAndEarn: 'Subir y ganar', saveWithout: 'Guardar sin subir',
    checkInComplete: '¡Check-in completado!', earned: '¡Puntos ganados!',
    forYouTitle: 'Para ti', explorers: 'Check-ins recientes de exploradores 🌍',
    createAccount: 'Crear cuenta', login: 'Entrar', alreadyHave: '¿Ya tienes cuenta?',
    loginHere: 'Inicia sesión aquí', noAccount: '¿No tienes cuenta?', createHere: 'Créala aquí',
    friendRequests: 'Solicitudes de amistad', myFriends: 'Mis amigos', accept: 'Aceptar', decline: 'Rechazar',
    noFriends: 'Sin amigos. ¡Agrega desde el mapa!',
    badgeDetails: 'Detalles de insignia', progress: 'Progreso', howToEarn: 'Cómo ganar',
    currentlyDark: 'Modo oscuro activo', currentlyLight: 'Modo claro activo',
    searchByName: 'Buscar por nombre…', search: 'Buscar', added: '✅ Agregado', add: '+ Agregar',
    pointsAvailable: 'puntos disponibles', recentEarnings: 'Ganancias recientes',
    howToEarnPoints: 'Cómo ganar puntos', plovdivExplored: 'Plovdiv explorado',
    recentVisits: 'Visitas recientes', seeAll: 'Ver todo →',
    noVisits: 'Sin check-ins. ¡Explora!', noPoints: 'Sin puntos. ¡Visita un museo!',
    chooseAvatar: 'Elegir avatar', explorerParrots: 'Loros exploradores', orUpload: 'O sube el tuyo',
    wantsToFriend: 'Quiere ser tu amigo',
    cameraError: 'Acceso a cámara denegado.', tryAgain: 'Intentar de nuevo',
    flipCamera: 'Voltear', livePhotoOnly: '📵 Solo fotos en vivo',
    photosCaptured: '✅ ¡Foto tomada!', confirmPhoto: 'Confirmar',
  },
} as const;

export type LangCode = keyof typeof TRANSLATIONS;
export type T = typeof TRANSLATIONS['en'];

interface AppContextType {
  darkMode: boolean;
  language: LangCode;
  t: T;
  setDarkMode: (v: boolean) => void;
  setLanguage: (lang: LangCode) => void;
}

const AppContext = createContext<AppContextType>({
  darkMode: false, language: 'en', t: TRANSLATIONS.en,
  setDarkMode: () => {}, setLanguage: () => {},
});

const DM_KEY = 'waygo_dark';
const LANG_KEY = 'waygo_lang';

export function AppProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkModeState] = useState<boolean>(() => localStorage.getItem(DM_KEY) === 'true');
  const [language, setLanguageState] = useState<LangCode>(() => (localStorage.getItem(LANG_KEY) as LangCode) || 'en');

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const setDarkMode = (v: boolean) => {
    setDarkModeState(v);
    localStorage.setItem(DM_KEY, String(v));
    if (v) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const setLanguage = (lang: LangCode) => {
    setLanguageState(lang);
    localStorage.setItem(LANG_KEY, lang);
  };

  const t = TRANSLATIONS[language] as T;

  return (
    <AppContext.Provider value={{ darkMode, language, t, setDarkMode, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
