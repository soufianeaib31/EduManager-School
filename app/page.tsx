'use client';

import React, { useState, useEffect, useCallback } from 'react';

// ============================================
// TYPES & INTERFACES
// ============================================

type SchoolType = 'maternelle' | 'primaire' | 'college';
type UserRole = 'directeur' | 'enseignant' | 'atsem' | 'aes' | 'aesh' | 'cpe' | 'aed' | 'infirmier' | 'admin' | 'cantinier' | 'parent';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  birthDate: string;
  class: string;
  level: string;
  parent1: { name: string; phone: string; email: string; relation: string };
  parent2?: { name: string; phone: string; email: string; relation: string };
  address: string;
  allergies: string[];
  pai: boolean;
  aesh: boolean;
  transport: boolean;
  cantine: boolean;
  diet: string;
  photo: string;
  health: string;
  emergencyContact: { name: string; phone: string };
}

interface Absence {
  id: string;
  studentId: string;
  date: string;
  type: 'absence' | 'retard' | 'depart_anticipe';
  reason: string;
  justified: boolean;
  reportedBy: string;
}

interface HealthEvent {
  id: string;
  studentId: string;
  date: string;
  type: 'visite' | 'urgence' | 'traitement' | 'pai';
  description: string;
  handledBy: string;
  followUp: string;
}

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  date: string;
  read: boolean;
  type: 'general' | 'urgent' | 'admin';
}

interface CantineMeal {
  id: string;
  date: string;
  menu: string;
  present: number;
  absent: number;
  specialDiets: number;
}

interface KPIData {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  staffPresent: number;
  staffAbsent: number;
  healthVisits: number;
  messagesPending: number;
  cantinePresent: number;
  incidents: number;
  paiActive: number;
  aeshActive: number;
}

interface SimulationEvent {
  id: string;
  time: string;
  type: 'arrivee' | 'appel' | 'retard' | 'incident' | 'infirmerie' | 'cantine' | 'sortie' | 'reunion' | 'urgence' | 'message_parent';
  description: string;
  studentId?: string;
  staffId?: string;
  resolved: boolean;
}

// ============================================
// DONNÉES DE TEST
// ============================================

const SCHOOL_TYPES: { id: SchoolType; name: string; icon: string; color: string; desc: string }[] = [
  { id: 'maternelle', name: 'École Maternelle', icon: '🎨', color: 'from-pink-500 to-rose-500', desc: '3 à 6 ans - Petits, Moyens, Grands' },
  { id: 'primaire', name: 'École Primaire', icon: '📚', color: 'from-blue-500 to-cyan-500', desc: 'CP à CM2 - 6 à 11 ans' },
  { id: 'college', name: 'Collège', icon: '🏫', color: 'from-emerald-500 to-teal-500', desc: '6ème à 3ème - 11 à 15 ans' },
];

const ROLES_BY_SCHOOL: Record<SchoolType, UserRole[]> = {
  maternelle: ['directeur', 'enseignant', 'atsem', 'aesh', 'infirmier', 'admin', 'cantinier'],
  primaire: ['directeur', 'enseignant', 'aesh', 'aes', 'infirmier', 'admin', 'cantinier'],
  college: ['directeur', 'enseignant', 'cpe', 'aed', 'aesh', 'infirmier', 'admin', 'cantinier'],
};

const generateStudents = (schoolType: SchoolType): Student[] => {
  const firstNames = ['Léa', 'Tom', 'Emma', 'Lucas', 'Chloé', 'Nathan', 'Manon', 'Enzo', 'Lola', 'Gabriel', 'Inès', 'Raphaël', 'Jules', 'Mila', 'Noah', 'Louise', 'Arthur', 'Camille', 'Louis', 'Zoé'];
  const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel'];
  const classesMaternelle = ['Petite Section A', 'Petite Section B', 'Moyenne Section A', 'Moyenne Section B', 'Grande Section A', 'Grande Section B'];
  const classesPrimaire = ['CP A', 'CP B', 'CE1 A', 'CE1 B', 'CE2 A', 'CE2 B', 'CM1 A', 'CM1 B', 'CM2 A', 'CM2 B'];
  const classesCollege = ['6ème A', '6ème B', '5ème A', '5ème B', '4ème A', '4ème B', '3ème A', '3ème B'];

  const allergiesList = [['aucune'], ['arachide'], ['gluten'], ['lactose'], ['oeuf'], ['arachide', 'gluten'], ['aucune'], ['aucune'], ['fruits secs'], ['aucune']];
  const diets = ['normal', 'vegetarien', 'sans_porc', 'halal', 'sans_gluten', 'normal', 'normal', 'normal', 'sans_lactose', 'normal'];

  const classes = schoolType === 'maternelle' ? classesMaternelle : schoolType === 'primaire' ? classesPrimaire : classesCollege;
  const levels = schoolType === 'maternelle' ? ['PS', 'PS', 'MS', 'MS', 'GS', 'GS'] : schoolType === 'primaire' ? ['CP', 'CP', 'CE1', 'CE1', 'CE2', 'CE2', 'CM1', 'CM1', 'CM2', 'CM2'] : ['6ème', '6ème', '5ème', '5ème', '4ème', '4ème', '3ème', '3ème'];

  const students: Student[] = [];
  for (let i = 0; i < 48; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[Math.floor(i / 2) % lastNames.length];
    const cls = classes[i % classes.length];
    const lvl = levels[i % levels.length];
    const gender = i % 2 === 0 ? 'M' : 'F';
    students.push({
      id: `S${String(i + 1).padStart(4, '0')}`,
      firstName: fn,
      lastName: ln,
      gender,
      birthDate: `${2015 + (i % 6)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      class: cls,
      level: lvl,
      parent1: { name: `M. et Mme ${ln}`, phone: `06 ${String(10 + i).padStart(2, '0')} ${String(20 + i).padStart(2, '0')} ${String(30 + i).padStart(2, '0')} ${String(40 + i).padStart(2, '0')}`, email: `parent${i + 1}@email.com`, relation: 'Parent' },
      parent2: i % 3 === 0 ? { name: `M. ${ln} (père)`, phone: `07 ${String(50 + i).padStart(2, '0')} ${String(60 + i).padStart(2, '0')} ${String(70 + i).padStart(2, '0')} ${String(80 + i).padStart(2, '0')}`, email: `parent2_${i + 1}@email.com`, relation: 'Père' } : undefined,
      address: `${i + 1} Rue de l'École, 33450 Saint-Loubès`,
      allergies: allergiesList[i % allergiesList.length],
      pai: i % 8 === 0,
      aesh: i % 12 === 0,
      transport: i % 4 !== 0,
      cantine: i % 5 !== 0,
      diet: diets[i % diets.length],
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fn}${ln}`,
      health: i % 7 === 0 ? 'Asthme léger - Ventoline à disposition' : 'RAS',
      emergencyContact: { name: `Mme ${ln} (grand-mère)`, phone: `05 56 ${String(50 + i).padStart(2, '0')} ${String(60 + i).padStart(2, '0')} ${String(70 + i).padStart(2, '0')}` },
    });
  }
  return students;
};


const generateStaff = (schoolType: SchoolType): StaffMember[] => {
  const baseStaff: StaffMember[] = [
    { id: 'ST001', name: 'Marie Dupont', email: 'marie.dupont@school.fr', role: 'directeur', department: 'Direction', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie' },
    { id: 'ST002', name: 'Pierre Martin', email: 'pierre.martin@school.fr', role: 'admin', department: 'Administration', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pierre' },
    { id: 'ST003', name: 'Sophie Bernard', email: 'sophie.bernard@school.fr', role: 'enseignant', department: 'Cycle 1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie' },
    { id: 'ST004', name: 'Jean Leroy', email: 'jean.leroy@school.fr', role: 'enseignant', department: 'Cycle 2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jean' },
    { id: 'ST005', name: 'Claire Dubois', email: 'claire.dubois@school.fr', role: 'enseignant', department: 'Cycle 3', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=claire' },
    { id: 'ST006', name: 'Nathalie Roux', email: 'nathalie.roux@school.fr', role: 'infirmier', department: 'Infirmerie', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nathalie' },
  ];
  if (schoolType === 'maternelle') {
    baseStaff.push(
      { id: 'ST007', name: 'Isabelle Petit', email: 'isabelle.petit@school.fr', role: 'atsem', department: 'Petite Section', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=isabelle' },
      { id: 'ST008', name: 'Sylvie Moreau', email: 'sylvie.moreau@school.fr', role: 'atsem', department: 'Moyenne Section', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sylvie' },
      { id: 'ST009', name: 'Caroline Simon', email: 'caroline.simon@school.fr', role: 'atsem', department: 'Grande Section', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=caroline' },
      { id: 'ST010', name: 'Monique Laurent', email: 'monique.laurent@school.fr', role: 'aesh', department: 'Support', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=monique' },
    );
  } else if (schoolType === 'primaire') {
    baseStaff.push(
      { id: 'ST007', name: 'André Michel', email: 'andre.michel@school.fr', role: 'aesh', department: 'CE1-CE2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andre' },
      { id: 'ST008', name: 'Brigitte Garcia', email: 'brigitte.garcia@school.fr', role: 'aesh', department: 'CM1-CM2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=brigitte' },
    );
  } else {
    baseStaff.push(
      { id: 'ST007', name: 'François David', email: 'francois.david@school.fr', role: 'cpe', department: 'Vie Scolaire', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=francois' },
      { id: 'ST008', name: 'Valérie Bertrand', email: 'valerie.bertrand@school.fr', role: 'cpe', department: 'Vie Scolaire', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=valerie' },
      { id: 'ST009', name: 'Julien Roux', email: 'julien.roux@school.fr', role: 'aed', department: 'Vie Scolaire', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=julien' },
      { id: 'ST010', name: 'Audrey Vincent', email: 'audrey.vincent@school.fr', role: 'aed', department: 'Vie Scolaire', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=audrey' },
      { id: 'ST011', name: 'Sébastien Fournier', email: 'sebastien.fournier@school.fr', role: 'aed', department: 'Vie Scolaire', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sebastien' },
    );
  }
  baseStaff.push({ id: 'ST099', name: 'Sandra Lefebvre', email: 'sandra.lefebvre@school.fr', role: 'cantinier', department: 'Restauration', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sandra' });
  return baseStaff;
};


const generateAbsences = (students: Student[]): Absence[] => {
  const absences: Absence[] = [];
  const today = new Date().toISOString().split('T')[0];
  students.slice(0, 8).forEach((s, i) => {
    absences.push({
      id: `A${String(i + 1).padStart(4, '0')}`,
      studentId: s.id,
      date: today,
      type: i % 3 === 0 ? 'absence' : i % 3 === 1 ? 'retard' : 'depart_anticipe',
      reason: ['Maladie', 'Rendez-vous médical', 'Famille', 'Mal de tête', 'Fatigue', 'Transport', 'Maladie', 'Rendez-vous'][i],
      justified: i % 2 === 0,
      reportedBy: ['Parent', 'Infirmier', 'Directeur', 'Professeur', 'CPE', 'AED', 'Parent', 'Infirmier'][i],
    });
  });
  return absences;
};

const generateHealthEvents = (students: Student[]): HealthEvent[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    { id: 'H001', studentId: students[2]?.id || 'S0001', date: today, type: 'visite', description: 'Mal de tête - repos 30min', handledBy: 'Nathalie Roux', followUp: 'Retour en classe' },
    { id: 'H002', studentId: students[5]?.id || 'S0002', date: today, type: 'pai', description: 'Traitement Ventoline - Asthme', handledBy: 'Nathalie Roux', followUp: 'À surveiller' },
    { id: 'H003', studentId: students[8]?.id || 'S0003', date: today, type: 'urgence', description: 'Chute dans la cour - genou écorché', handledBy: 'Nathalie Roux', followUp: 'Parents prévenus' },
    { id: 'H004', studentId: students[12]?.id || 'S0004', date: today, type: 'traitement', description: 'Administration médicaments - PAI actif', handledBy: 'Nathalie Roux', followUp: 'OK' },
  ];
};

const generateMessages = (): Message[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    { id: 'M001', from: 'parent1@email.com', to: 'Direction', subject: 'Absence prévue demain', content: 'Mon enfant sera absent demain pour rendez-vous médical.', date: today, read: false, type: 'general' },
    { id: 'M002', from: 'jean.leroy@school.fr', to: 'Direction', subject: 'Urgent - Incident en classe', content: 'Incident entre deux élèves en CE1. Intervention nécessaire.', date: today, read: false, type: 'urgent' },
    { id: 'M003', from: 'Direction', to: 'parent3@email.com', subject: 'Convocation réunion', content: 'Nous vous invitons à une réunion le 15 mai à 17h.', date: today, read: true, type: 'admin' },
    { id: 'M004', from: 'nathalie.roux@school.fr', to: 'Direction', subject: 'PAI à renouveler', content: 'Le PAI de Thomas Martin arrive à expiration.', date: today, read: true, type: 'general' },
    { id: 'M005', from: 'parent5@email.com', to: 'CPE', subject: 'Demande RDV', content: 'Je souhaite rencontrer le CPE concernant le comportement de mon enfant.', date: today, read: false, type: 'general' },
  ];
};

const generateCantineData = (): CantineMeal[] => {
  const menus = ['Pâtes bolo + yaourt', 'Poulet rôti + riz + compote', 'Poisson pané + frites + fruit', 'Omelette + haricots verts + fromage', 'Steak haché + purée + fruit', 'Pizza maison + salade + dessert', 'Saumon + quinoa + yaourt'];
  return menus.map((menu, i) => ({
    id: `C${String(i + 1).padStart(3, '0')}`,
    date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
    menu,
    present: 35 + Math.floor(Math.random() * 15),
    absent: Math.floor(Math.random() * 10),
    specialDiets: 3 + Math.floor(Math.random() * 4),
  }));
};


const SIMULATION_EVENTS: Omit<SimulationEvent, 'id' | 'resolved'>[] = [
  { time: '07:45', type: 'arrivee', description: 'Arrivée des premiers élèves - Accueil du matin' },
  { time: '08:00', type: 'appel', description: 'Appel dans toutes les classes - Début des cours' },
  { time: '08:15', type: 'retard', description: 'Retard signalé: 3 élèves en retard', studentId: 'S0003' },
  { time: '08:30', type: 'message_parent', description: 'Nouveau message d\'un parent concernant une absence', studentId: 'S0001' },
  { time: '09:15', type: 'infirmerie', description: 'Passage infirmerie: mal de tête - repos', studentId: 'S0002' },
  { time: '10:00', type: 'incident', description: 'Incident dans la cour - dispute entre élèves', studentId: 'S0005' },
  { time: '10:30', type: 'cantine', description: 'Préparation du service cantine - Vérification régimes' },
  { time: '11:00', type: 'infirmerie', description: 'Passage infirmerie: Traitement PAI asthme', studentId: 'S0004' },
  { time: '12:00', type: 'cantine', description: 'Service cantine en cours - 42 présents / 48 inscrits' },
  { time: '13:30', type: 'appel', description: 'Reprise des cours - Appel après cantine' },
  { time: '14:00', type: 'urgence', description: 'URGENCE: Chute dans la cour - genou écorché', studentId: 'S0003' },
  { time: '14:30', type: 'reunion', description: 'Réunion équipe pédagogique - Conseil de cycle' },
  { time: '15:30', type: 'message_parent', description: 'Demande RDV parent-CPE concernant comportement', studentId: 'S0007' },
  { time: '16:00', type: 'sortie', description: 'Sortie des classes - Fin de journée' },
  { time: '16:30', type: 'arrivee', description: 'Accueil périscolaire / garderie' },
];


// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function EduManagerSchool() {
  const [schoolType, setSchoolType] = useState<SchoolType | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [cantineData, setCantineData] = useState<CantineMeal[]>([]);
  const [simulationEvents, setSimulationEvents] = useState<SimulationEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(2000);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (schoolType) {
      const studs = generateStudents(schoolType);
      setStudents(studs);
      setStaff(generateStaff(schoolType));
      setAbsences(generateAbsences(studs));
      setHealthEvents(generateHealthEvents(studs));
      setMessages(generateMessages());
      setCantineData(generateCantineData());
    }
  }, [schoolType]);

  const kpi: KPIData = {
    totalStudents: students.length,
    presentToday: Math.floor(students.length * 0.85),
    absentToday: absences.filter(a => a.type === 'absence').length,
    lateToday: absences.filter(a => a.type === 'retard').length,
    staffPresent: Math.floor(staff.length * 0.9),
    staffAbsent: Math.ceil(staff.length * 0.1),
    healthVisits: healthEvents.filter(h => h.type === 'visite').length,
    messagesPending: messages.filter(m => !m.read).length,
    cantinePresent: cantineData[0]?.present || 0,
    incidents: absences.length + healthEvents.filter(h => h.type === 'urgence').length,
    paiActive: students.filter(s => s.pai).length,
    aeshActive: students.filter(s => s.aesh).length,
  };


  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    setSimulationEvents([]);
    let index = 0;
    const interval = setInterval(() => {
      if (index >= SIMULATION_EVENTS.length) {
        clearInterval(interval);
        setIsSimulating(false);
        return;
      }
      const evt = SIMULATION_EVENTS[index];
      setSimulationEvents(prev => [...prev, { ...evt, id: `SIM${String(index + 1).padStart(3, '0')}`, resolved: false }]);
      index++;
    }, simulationSpeed);
  }, [simulationSpeed]);

  const resolveEvent = (eventId: string) => {
    setSimulationEvents(prev => prev.map(e => e.id === eventId ? { ...e, resolved: true } : e));
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    const user = staff.find(s => s.role === (role === 'parent' ? 'directeur' : role));
    setCurrentUser(user || staff[0]);
  };

  const filteredStudents = students.filter(s =>
    s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEventTypeColor = (type: SimulationEvent['type']) => {
    const colors: Record<string, string> = {
      arrivee: 'bg-green-100 border-green-500 text-green-800',
      appel: 'bg-blue-100 border-blue-500 text-blue-800',
      retard: 'bg-yellow-100 border-yellow-500 text-yellow-800',
      incident: 'bg-orange-100 border-orange-500 text-orange-800',
      infirmerie: 'bg-red-100 border-red-500 text-red-800',
      cantine: 'bg-purple-100 border-purple-500 text-purple-800',
      sortie: 'bg-gray-100 border-gray-500 text-gray-800',
      reunion: 'bg-indigo-100 border-indigo-500 text-indigo-800',
      urgence: 'bg-red-600 border-red-700 text-white',
      message_parent: 'bg-pink-100 border-pink-500 text-pink-800',
    };
    return colors[type] || 'bg-gray-100';
  };


  // ============================================
  // ÉCRAN DE SÉLECTION D'ÉTABLISSEMENT
  // ============================================
  if (!schoolType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">🏫 EduManager School</h1>
          <p className="text-xl text-slate-400">Sélectionnez le type d'établissement</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {SCHOOL_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSchoolType(type.id)}
              className={`group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br ${type.color} shadow-2xl transform hover:scale-105 transition-all duration-300 text-left`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="relative z-10">
                <div className="text-6xl mb-4">{type.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">{type.name}</h2>
                <p className="text-white/80 text-sm">{type.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }


  // ============================================
  // ÉCRAN DE LOGIN
  // ============================================
  if (!userRole) {
    const schoolName = SCHOOL_TYPES.find(t => t.id === schoolType)?.name || 'École';
    const availableRoles = ROLES_BY_SCHOOL[schoolType];
    const roleLabels: Record<UserRole, string> = {
      directeur: '👔 Directeur/Principal',
      enseignant: '📖 Enseignant(e)',
      atsem: '🧸 ATSEM',
      aes: '🔧 Personnel technique',
      aesh: '♿ AESH',
      cpe: '📋 CPE',
      aed: '📝 AED (Vie Scolaire)',
      infirmier: '🏥 Infirmier(ère)',
      admin: '💼 Administration',
      cantinier: '🍽️ Personnel cantine',
      parent: '👨‍👩‍👧‍👦 Parent',
    };
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
        <button onClick={() => setSchoolType(null)} className="absolute top-4 left-4 text-slate-400 hover:text-white flex items-center gap-2">← Retour</button>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔐 Connexion - {schoolName}</h1>
          <p className="text-slate-400">Sélectionnez votre profil</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full">
          {availableRoles.map((role) => (
            <button
              key={role}
              onClick={() => handleLogin(role)}
              className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 transition-all text-left group"
            >
              <div className="text-lg font-medium text-white group-hover:text-blue-400">{roleLabels[role]}</div>
              <div className="text-sm text-slate-500 mt-1">Cliquer pour se connecter</div>
            </button>
          ))}
        </div>
      </div>
    );
  }


  // ============================================
  // DASHBOARD PRINCIPAL
  // ============================================
  const schoolName = SCHOOL_TYPES.find(t => t.id === schoolType)?.name || 'École';
  const schoolIcon = SCHOOL_TYPES.find(t => t.id === schoolType)?.icon || '🏫';
  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'eleves', label: '👶 Élèves', icon: '👶' },
    { id: 'personnel', label: '👥 Personnel', icon: '👥' },
    { id: 'absences', label: '📅 Absences', icon: '📅' },
    { id: 'sante', label: '🏥 Santé', icon: '🏥' },
    { id: 'cantine', label: '🍽️ Cantine', icon: '🍽️' },
    { id: 'messages', label: '💬 Messages', icon: '💬' },
    { id: 'simulateur', label: '🎮 Simulateur', icon: '🎮' },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-slate-100'} flex`}>
      {/* SIDEBAR */}
      <aside className={`w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl flex flex-col fixed h-full z-20`}>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{schoolIcon}</span>
            <div>
              <h1 className="font-bold text-slate-800">EduManager</h1>
              <p className="text-xs text-slate-500">{schoolName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-100">
            <img src={currentUser?.avatar} alt="avatar" className="w-10 h-10 rounded-full bg-slate-300" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{currentUser?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{userRole}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 space-y-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full px-4 py-2 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            {darkMode ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
          </button>
          <button
            onClick={() => { setSchoolType(null); setUserRole(null); setCurrentUser(null); }}
            className="w-full px-4 py-2 rounded-lg text-sm bg-red-100 hover:bg-red-200 text-red-700"
          >
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      
      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1 p-6 overflow-y-auto h-screen">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{schoolName}</h2>
            <p className="text-slate-500 text-sm">Tableau de bord de gestion - {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Rechercher un élève..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50"
            >
              🔔
              {kpi.messagesPending > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{kpi.messagesPending}</span>
              )}
            </button>
          </div>
        </header>

        {/* ============================================ */}
        {/* ONGLET DASHBOARD - KPI CARDS */}
        {/* ============================================ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI ROW 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Élèves', value: kpi.totalStudents, color: 'from-blue-500 to-blue-600', icon: '👶' },
                { label: 'Présents', value: kpi.presentToday, color: 'from-green-500 to-green-600', icon: '✅' },
                { label: 'Absents', value: kpi.absentToday, color: 'from-red-500 to-red-600', icon: '❌' },
                { label: 'Retards', value: kpi.lateToday, color: 'from-yellow-500 to-yellow-600', icon: '⏰' },
                { label: 'Staff Présent', value: kpi.staffPresent, color: 'from-purple-500 to-purple-600', icon: '👥' },
                { label: 'Incidents', value: kpi.incidents, color: 'from-orange-500 to-orange-600', icon: '⚠️' },
              ].map((kpiCard, i) => (
                <div key={i} className={`rounded-xl p-4 bg-gradient-to-br ${kpiCard.color} text-white shadow-lg`}>
                  <div className="text-3xl mb-2">{kpiCard.icon}</div>
                  <div className="text-3xl font-bold">{kpiCard.value}</div>
                  <div className="text-sm opacity-80">{kpiCard.label}</div>
                </div>
              ))}
            </div>

            
            {/* KPI ROW 2 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Visites Infirmerie', value: kpi.healthVisits, color: 'from-red-400 to-pink-500', icon: '🏥' },
                { label: 'Messages non lus', value: kpi.messagesPending, color: 'from-indigo-500 to-purple-600', icon: '💬' },
                { label: 'Cantine (midi)', value: kpi.cantinePresent, color: 'from-emerald-500 to-teal-600', icon: '🍽️' },
                { label: 'PAI Actifs', value: kpi.paiActive, color: 'from-amber-500 to-orange-600', icon: '📋' },
                { label: 'AESHE Actifs', value: kpi.aeshActive, color: 'from-cyan-500 to-blue-600', icon: '♿' },
                { label: 'Staff Absent', value: kpi.staffAbsent, color: 'from-gray-500 to-gray-600', icon: '😴' },
              ].map((kpiCard, i) => (
                <div key={i} className={`rounded-xl p-4 bg-gradient-to-br ${kpiCard.color} text-white shadow-lg`}>
                  <div className="text-3xl mb-2">{kpiCard.icon}</div>
                  <div className="text-3xl font-bold">{kpiCard.value}</div>
                  <div className="text-sm opacity-80">{kpiCard.label}</div>
                </div>
              ))}
            </div>

            
            {/* DASHBOARD DETAILS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ABSENCES RECENTES */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">📅 Absences & Retards du jour</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 text-slate-500 font-medium">Élève</th>
                        <th className="text-left py-2 text-slate-500 font-medium">Type</th>
                        <th className="text-left py-2 text-slate-500 font-medium">Motif</th>
                        <th className="text-left py-2 text-slate-500 font-medium">Signalé par</th>
                        <th className="text-center py-2 text-slate-500 font-medium">Justifié</th>
                      </tr>
                    </thead>
                    <tbody>
                      {absences.slice(0, 8).map((a) => {
                        const student = students.find(s => s.id === a.studentId);
                        const typeColors: Record<string, string> = { absence: 'bg-red-100 text-red-700', retard: 'bg-yellow-100 text-yellow-700', depart_anticipe: 'bg-orange-100 text-orange-700' };
                        const typeLabels: Record<string, string> = { absence: 'Absence', retard: 'Retard', depart_anticipe: 'Départ anticipé' };
                        return (
                          <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-2 font-medium">{student ? `${student.firstName} ${student.lastName}` : '—'}</td>
                            <td className="py-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[a.type]}`}>{typeLabels[a.type]}</span></td>
                            <td className="py-2 text-slate-600">{a.reason}</td>
                            <td className="py-2 text-slate-600">{a.reportedBy}</td>
                            <td className="py-2 text-center">{a.justified ? '✅' : '❌'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MESSAGES RECENTS */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">💬 Messages récents</h3>
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className={`p-3 rounded-lg border-l-4 ${m.type === 'urgent' ? 'bg-red-50 border-red-500' : m.type === 'admin' ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-300'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-slate-800">{m.subject}</span>
                        {!m.read && <span className="w-2 h-2 rounded-full bg-red-500" />}
                      </div>
                      <p className="text-xs text-slate-600 mb-1">De: {m.from}</p>
                      <p className="text-xs text-slate-500 truncate">{m.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* EVENTS DU JOUR */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">📋 Événements de santé du jour</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {healthEvents.map((h) => {
                  const student = students.find(s => s.id === h.studentId);
                  const typeIcons: Record<string, string> = { visite: '🩺', urgence: '🚨', traitement: '💊', pai: '📋' };
                  const typeColors: Record<string, string> = { visite: 'bg-blue-100', urgence: 'bg-red-100', traitement: 'bg-green-100', pai: 'bg-amber-100' };
                  return (
                    <div key={h.id} className={`p-4 rounded-lg ${typeColors[h.type]} border`}>      <div className="text-2xl mb-2">{typeIcons[h.type]}</div>
                      <p className="font-medium text-slate-800 text-sm">{student ? `${student.firstName} ${student.lastName}` : '—'}</p>
                      <p className="text-xs text-slate-600 mt-1">{h.description}</p>
                      <p className="text-xs text-slate-500 mt-2">Suivi: {h.followUp}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        
        {/* ============================================ */}
        {/* ONGLET ÉLÈVES */}
        {/* ============================================ */}
        {activeTab === 'eleves' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">👶 Liste des élèves ({filteredStudents.length})</h3>
                <span className="text-sm text-slate-500">{schoolName}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-slate-500 font-medium">Photo</th>
                      <th className="text-left py-2 px-3 text-slate-500 font-medium">Nom</th>
                      <th className="text-left py-2 px-3 text-slate-500 font-medium">Classe</th>
                      <th className="text-left py-2 px-3 text-slate-500 font-medium">Niveau</th>
                      <th className="text-center py-2 px-3 text-slate-500 font-medium">PAI</th>
                      <th className="text-center py-2 px-3 text-slate-500 font-medium">AESH</th>
                      <th className="text-center py-2 px-3 text-slate-500 font-medium">Cantine</th>
                      <th className="text-center py-2 px-3 text-slate-500 font-medium">Allergies</th>
                      <th className="text-center py-2 px-3 text-slate-500 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-3"><img src={s.photo} alt="" className="w-8 h-8 rounded-full bg-slate-200" /></td>
                        <td className="py-2 px-3 font-medium">{s.firstName} {s.lastName}</td>
                        <td className="py-2 px-3 text-slate-600">{s.class}</td>
                        <td className="py-2 px-3 text-slate-600">{s.level}</td>
                        <td className="py-2 px-3 text-center">{s.pai ? '⚠️ Oui' : '✅ Non'}</td>
                        <td className="py-2 px-3 text-center">{s.aesh ? '⚠️ Oui' : '✅ Non'}</td>
                        <td className="py-2 px-3 text-center">{s.cantine ? `✅ ${s.diet}` : '❌'}</td>
                        <td className="py-2 px-3 text-center">{s.allergies[0] === 'aucune' ? '✅ Aucune' : '⚠️ ' + s.allergies.join(', ')}</td>
                        <td className="py-2 px-3 text-center">
                          <button onClick={() => setSelectedStudent(s)} className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600">Voir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* MODAL FICHE ÉLÈVE */}
            {selectedStudent && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedStudent(null)}>
                <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex items-start gap-4 mb-4">
                    <img src={selectedStudent.photo} alt="" className="w-20 h-20 rounded-full bg-slate-200" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                      <p className="text-slate-500">{selectedStudent.class} - {selectedStudent.level} | Né(e) le {selectedStudent.birthDate}</p>
                    </div>
                    <button onClick={() => setSelectedStudent(null)} className="text-2xl text-slate-400 hover:text-slate-600">&times;</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-slate-50 rounded-lg"><strong>Parent 1:</strong> {selectedStudent.parent1.name}<br/><span className="text-sm text-slate-500">{selectedStudent.parent1.phone}</span></div>
                    {selectedStudent.parent2 && <div className="p-3 bg-slate-50 rounded-lg"><strong>Parent 2:</strong> {selectedStudent.parent2.name}<br/><span className="text-sm text-slate-500">{selectedStudent.parent2.phone}</span></div>}
                    <div className="p-3 bg-slate-50 rounded-lg"><strong>Adresse:</strong> {selectedStudent.address}</div>
                    <div className="p-3 bg-slate-50 rounded-lg"><strong>Contact urgence:</strong> {selectedStudent.emergencyContact.name}<br/><span className="text-sm text-slate-500">{selectedStudent.emergencyContact.phone}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg"><strong>Allergies:</strong> {selectedStudent.allergies.join(', ')}</div>
                    <div className="p-3 bg-slate-50 rounded-lg"><strong>Santé:</strong> {selectedStudent.health}</div>
                    <div className="p-3 bg-slate-50 rounded-lg"><strong>Régime:</strong> {selectedStudent.diet}</div>
                    <div className="p-3 bg-slate-50 rounded-lg"><strong>Cantine:</strong> {selectedStudent.cantine ? 'Oui' : 'Non'} | <strong>Transport:</strong> {selectedStudent.transport ? 'Oui' : 'Non'}</div>
                    <div className="p-3 bg-slate-50 rounded-lg"><strong>PAI:</strong> {selectedStudent.pai ? '⚠️ Actif' : 'Non'}</div>
                    <div className="p-3 bg-slate-50 rounded-lg"><strong>AESH:</strong> {selectedStudent.aesh ? '⚠️ Attribué' : 'Non'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        
        {/* ============================================ */}
        {/* ONGLET PERSONNEL */}
        {/* ============================================ */}
        {activeTab === 'personnel' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">👥 Personnel de l'établissement ({staff.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <img src={s.avatar} alt="" className="w-12 h-12 rounded-full bg-slate-200" />
                    <div>
                      <p className="font-medium text-slate-800">{s.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{s.role} — {s.department}</p>
                      <p className="text-xs text-slate-400">{s.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* STATS PAR DÉPARTEMENT */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Direction', 'Enseignement', 'Vie Scolaire', 'Administration', 'Infirmerie', 'Restauration', 'ATSEM', 'AESH'].map((dept) => {
                const count = staff.filter(s => s.department.includes(dept) || s.role.includes(dept.toLowerCase().split(' ')[0])).length;
                if (count === 0) return null;
                return (
                  <div key={dept} className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                    <div className="text-3xl font-bold">{count}</div>
                    <div className="text-sm opacity-80">{dept}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* ONGLET ABSENCES */}
        {/* ============================================ */}
        {activeTab === 'absences' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">📅 Toutes les absences & retards</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 text-slate-500 font-medium">Élève</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Classe</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Type</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Motif</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Date</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Signalé par</th>
                      <th className="text-center py-2 text-slate-500 font-medium">Justifié</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absences.map((a) => {
                      const student = students.find(s => s.id === a.studentId);
                      const typeColors: Record<string, string> = { absence: 'bg-red-100 text-red-700', retard: 'bg-yellow-100 text-yellow-700', depart_anticipe: 'bg-orange-100 text-orange-700' };
                      return (
                        <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 font-medium">{student ? `${student.firstName} ${student.lastName}` : '—'}</td>
                          <td className="py-2 text-slate-600">{student?.class || '—'}</td>
                          <td className="py-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[a.type]}`}>{a.type}</span></td>
                          <td className="py-2 text-slate-600">{a.reason}</td>
                          <td className="py-2 text-slate-600">{a.date}</td>
                          <td className="py-2 text-slate-600">{a.reportedBy}</td>
                          <td className="py-2 text-center">{a.justified ? '✅' : '❌'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        
        {/* ============================================ */}
        {/* ONGLET SANTÉ */}
        {/* ============================================ */}
        {activeTab === 'sante' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">🏥 Registre de santé - {new Date().toLocaleDateString('fr-FR')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {healthEvents.map((h) => {
                  const student = students.find(s => s.id === h.studentId);
                  const typeIcons: Record<string, string> = { visite: '🩺', urgence: '🚨', traitement: '💊', pai: '📋' };
                  const typeColors: Record<string, string> = { visite: 'bg-blue-100 border-blue-500', urgence: 'bg-red-100 border-red-500', traitement: 'bg-green-100 border-green-500', pai: 'bg-amber-100 border-amber-500' };
                  return (
                    <div key={h.id} className={`p-4 rounded-lg border-l-4 ${typeColors[h.type]}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{typeIcons[h.type]}</span>
                        <span className="text-xs text-slate-500">{h.date}</span>
                      </div>
                      <p className="font-medium text-slate-800">{student ? `${student.firstName} ${student.lastName}` : '—'}</p>
                      <p className="text-sm text-slate-600 mt-1">{h.description}</p>
                      <p className="text-xs text-slate-500 mt-2">Traité par: {h.handledBy} | Suivi: {h.followUp}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* ÉLÈVES AVEC PAI */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">⚠️ Élèves avec PAI actif</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 text-slate-500 font-medium">Élève</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Classe</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Santé</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Allergies</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Régime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => s.pai || s.health !== 'RAS' || s.allergies[0] !== 'aucune').map((s) => (
                      <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 font-medium">{s.firstName} {s.lastName}</td>
                        <td className="py-2 text-slate-600">{s.class}</td>
                        <td className="py-2 text-slate-600">{s.health}</td>
                        <td className="py-2 text-slate-600">{s.allergies[0] === 'aucune' ? 'Aucune' : s.allergies.join(', ')}</td>
                        <td className="py-2 text-slate-600">{s.diet}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* ONGLET CANTINE */}
        {/* ============================================ */}
        {activeTab === 'cantine' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">🍽️ Planning cantine - Semaine en cours</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 text-slate-500 font-medium">Date</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Menu</th>
                      <th className="text-center py-2 text-slate-500 font-medium">Présents</th>
                      <th className="text-center py-2 text-slate-500 font-medium">Absents</th>
                      <th className="text-center py-2 text-slate-500 font-medium">Régimes spéciaux</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cantineData.map((c) => (
                      <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 font-medium">{new Date(c.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                        <td className="py-2 text-slate-600">{c.menu}</td>
                        <td className="py-2 text-center">{c.present}</td>
                        <td className="py-2 text-center">{c.absent}</td>
                        <td className="py-2 text-center">{c.specialDiets}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* RÉGIMES SPÉCIAUX */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">🥗 Régimes spéciaux actifs</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['normal', 'vegetarien', 'sans_porc', 'halal', 'sans_gluten', 'sans_lactose'].map((diet) => {
                  const count = students.filter(s => s.cantine && s.diet === diet).length;
                  if (count === 0) return null;
                  return (
                    <div key={diet} className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center">
                      <div className="text-2xl font-bold text-slate-800">{count}</div>
                      <div className="text-sm text-slate-500 capitalize">{diet.replace('_', ' ')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        
        {/* ============================================ */}
        {/* ONGLET MESSAGES */}
        {/* ============================================ */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">💬 Boîte de messages</h3>
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`p-4 rounded-lg border-l-4 ${m.type === 'urgent' ? 'bg-red-50 border-red-500' : m.type === 'admin' ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-800">{m.subject}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.type === 'urgent' ? 'bg-red-200 text-red-700' : m.type === 'admin' ? 'bg-blue-200 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>{m.type}</span>
                        {!m.read && <span className="w-3 h-3 rounded-full bg-red-500" title="Non lu" />}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-1"><strong>De:</strong> {m.from} → <strong>À:</strong> {m.to}</p>
                    <p className="text-sm text-slate-700">{m.content}</p>
                    <p className="text-xs text-slate-400 mt-2">{m.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        
        {/* ============================================ */}
        {/* ONGLET SIMULATEUR */}
        {/* ============================================ */}
        {activeTab === 'simulateur' && (
          <div className="space-y-6">
            {/* CONTROLS */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">🎮 Simulateur de journée scolaire</h3>
                  <p className="text-white/80 text-sm">Simulez une journée complète dans votre établissement. Chaque événement déclenche des actions et des notifications dans les différents modules.</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={simulationSpeed}
                    onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                    className="px-4 py-2 rounded-lg bg-white text-slate-800 text-sm font-medium"
                  >
                    <option value={3000}>🐢 Lent (3s/événement)</option>
                    <option value={2000}>🚶 Normal (2s/événement)</option>
                    <option value={1000}>🏃 Rapide (1s/événement)</option>
                    <option value={500}>⚡ Turbo (0.5s/événement)</option>
                  </select>
                  <button
                    onClick={startSimulation}
                    disabled={isSimulating}
                    className={`px-6 py-2 rounded-lg font-bold text-white ${isSimulating ? 'bg-slate-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'} transition-all`}
                  >
                    {isSimulating ? '⏳ Simulation en cours...' : '▶️ Lancer la simulation'}
                  </button>
                  <button
                    onClick={() => { setSimulationEvents([]); setIsSimulating(false); }}
                    className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium"
                  >
                    🔄 Réinitialiser
                  </button>
                </div>
              </div>
            </div>

            
            {/* TIMELINE DES ÉVÉNEMENTS */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">📜 Journal de la journée</h4>
              {simulationEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-6xl mb-4">🎬</div>
                  <p>Appuyez sur "Lancer la simulation" pour commencer</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {SIMULATION_EVENTS.map((evt, idx) => {
                    const simEvt = simulationEvents.find(s => s.id === `SIM${String(idx + 1).padStart(3, '0')}`);
                    const isCompleted = !!simEvt?.resolved;
                    const isCurrent = isSimulating && simulationEvents.length === idx + 1;
                    const isPending = !simEvt;
                    const student = students.find(s => s.id === evt.studentId);
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                          isCompleted ? getEventTypeColor(evt.type) + ' opacity-60' :
                          isCurrent ? getEventTypeColor(evt.type) + ' shadow-lg scale-105' :
                          isPending ? 'bg-slate-50 border-slate-200 text-slate-400' :
                          getEventTypeColor(evt.type)
                        }`}
                      >
                        <div className="flex-shrink-0 w-16 text-right font-mono font-bold">{evt.time}</div>
                        <div className="w-0.5 h-full bg-current opacity-30 mx-2 hidden md:block" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold">{evt.type.toUpperCase()}</span>
                            {isCurrent && <span className="animate-pulse text-xs bg-white/30 px-2 py-0.5 rounded">● EN COURS</span>}
                            {isCompleted && <span className="text-xs bg-white/30 px-2 py-0.5 rounded">✓ Résolu</span>}
                          </div>
                          <p className="text-sm">{evt.description}</p>
                          {student && <p className="text-xs opacity-70 mt-1">Élève concerné: {student.firstName} {student.lastName}</p>}
                        </div>
                        {isCurrent && (
                          <button
                            onClick={() => resolveEvent(`SIM${String(idx + 1).padStart(3, '0')}`)}
                            className="px-3 py-1 rounded bg-white/30 hover:bg-white/50 text-sm font-medium whitespace-nowrap"
                          >
                            ✅ Résoudre
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            
            {/* IMPACT SUR LES KPI */}
            {simulationEvents.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-slate-800 mb-4">📊 Impact en temps réel sur les KPI</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <div className="text-sm text-slate-500">Retards enregistrés</div>
                    <div className="text-2xl font-bold text-blue-600">{simulationEvents.filter(e => e.type === 'retard').length}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50">
                    <div className="text-sm text-slate-500">Visites infirmerie</div>
                    <div className="text-2xl font-bold text-red-600">{simulationEvents.filter(e => e.type === 'infirmerie').length}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50">
                    <div className="text-sm text-slate-500">Incidents</div>
                    <div className="text-2xl font-bold text-orange-600">{simulationEvents.filter(e => e.type === 'incident' || e.type === 'urgence').length}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50">
                    <div className="text-sm text-slate-500">Événements résolus</div>
                    <div className="text-2xl font-bold text-green-600">{simulationEvents.filter(e => e.resolved).length} / {simulationEvents.length}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
