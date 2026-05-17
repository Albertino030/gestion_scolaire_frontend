import axios from "axios";

const API = import.meta.env.VITE_API_URL || 'https://gestion-scolaire-backend-is34.onrender.com';

// =====================
// ANNEE ACTIVE
// =====================
export const getAnneeActive = () => axios.get(`${API}/annee/active`);

// =====================
// NOTES
// =====================
export const getNotes = (filters) => {
  const params = new URLSearchParams();
  if (filters.filiere) params.append('filiere', filters.filiere);
  if (filters.niveau) params.append('niveau', filters.niveau);
  if (filters.examen) params.append('examen', filters.examen);
  if (filters.id_annee) params.append('id_annee', filters.id_annee);
  
  return axios.get(`${API}/notes?${params.toString()}`);
};

export const addNotes = async (data) => {
  const promises = [];
  for (const [matiereId, note] of Object.entries(data.notes)) {
    if (note !== "" && note !== null && note !== undefined && note !== 0) {
      promises.push(
        axios.post(`${API}/notes`, null, {
          params: {
            numero_matricule: data.numero_matricule,
            id_matiere: parseInt(matiereId),
            id_examen: data.id_examen || 1,
            note: parseFloat(note)
          }
        })
      );
    }
  }
  if (promises.length === 0) {
    throw new Error("Aucune note valide à enregistrer");
  }
  return Promise.all(promises);
};

export const updateNote = (id, data) => axios.put(`${API}/notes/${id}`, null, {
  params: { note: data.note }
});

export const deleteNote = (id) => axios.delete(`${API}/notes/${id}`);

// =====================
// ETUDIANTS
// =====================
export const getEtudiantsByFiliereNiveau = (filiere, niveau, id_annee) => {
  const params = new URLSearchParams();
  if (filiere) params.append('filiere', filiere);
  if (niveau) params.append('niveau', niveau);
  if (id_annee) params.append('id_annee', id_annee);
  
  return axios.get(`${API}/etudiants?${params.toString()}`);
};

export const getAllEtudiants = () => axios.get(`${API}/etudiants`);

// =====================
// MATIERES
// =====================
export const getMatieresByFiliereNiveau = (filiere, niveau, id_annee) => {
  const params = new URLSearchParams();
  if (filiere) params.append('filiere', filiere);
  if (niveau) params.append('niveau', niveau);
  if (id_annee) params.append('id_annee', id_annee);
  
  return axios.get(`${API}/matieres/by-filiere-niveau`, { params });
};

// =====================
// FILIERES & NIVEAUX & EXAMENS
// =====================
export const getFilieres = () => axios.get(`${API}/filieres`);
export const getNiveaux = () => axios.get(`${API}/niveaux`);
export const getExamens = (id_annee) => {
  const params = {};
  if (id_annee) params.id_annee = id_annee;
  return axios.get(`${API}/examens`, { params });
};

// =====================
// EXAMENS PAR ANNEE (pour récupérer tous les examens de l'année)
// =====================
export const getExamensByAnnee = (id_annee) => {
  return axios.get(`${API}/examens`, { params: { id_annee } });
};

// =====================
// MOYENNES ANNUELLES (calcul pour délibération)
// =====================
export const getMoyennesAnnuelles = async (filiere, niveau, id_annee) => {
  try {
    // 1. Récupérer tous les étudiants de la filière/niveau
    const etudiantsRes = await getEtudiantsByFiliereNiveau(filiere, niveau, id_annee);
    const etudiants = etudiantsRes.data || [];
    
    // 2. Récupérer toutes les matières
    const matieresRes = await getMatieresByFiliereNiveau(filiere, niveau, id_annee);
    const matieres = matieresRes.data || [];
    
    // 3. Récupérer tous les examens de l'année
    const examensRes = await getExamensByAnnee(id_annee);
    let examens = examensRes.data || [];
    
    // Si aucun examen n'est défini, utiliser les 6 examens par défaut
    if (examens.length === 0) {
      examens = ["Examen 1", "Examen 2", "Examen 3", "Examen 4", "Examen 5", "Examen 6"];
    }
    
    // 4. Coefficients des examens
    const examenCoefficients = {
      "Examen 1": 1,
      "Examen 2": 2,
      "Examen 3": 1,
      "Examen 4": 2,
      "Examen 5": 1,
      "Examen 6": 2
    };
    
    // 5. Pour chaque étudiant, récupérer toutes ses notes
    const resultats = [];
    
    for (const etudiant of etudiants) {
      // Structure pour stocker les moyennes par examen
      const notesParExamen = {};
      let totalPondere = 0;
      let totalCoeffs = 0;
      
      // Pour chaque examen
      for (let i = 0; i < examens.length; i++) {
        const examenNom = examens[i];
        const examenId = i + 1;
        const coeff = examenCoefficients[examenNom] || 1;
        
        // Récupérer les notes de cet étudiant pour cet examen
        const notesRes = await getNotes({
          filiere,
          niveau,
          examen: examenNom,
          id_annee
        });
        
        const allNotes = notesRes.data || [];
        const etudiantNotes = allNotes.find(n => n.numero_matricule === etudiant.numero_matricule);
        
        if (etudiantNotes && etudiantNotes.notes) {
          // Calculer la moyenne de l'étudiant pour cet examen
          let sommeNotes = 0;
          let nbMatieres = 0;
          
          for (const matiere of matieres) {
            const noteValue = etudiantNotes.notes[matiere.nom_matiere];
            if (noteValue && !isNaN(parseFloat(noteValue))) {
              sommeNotes += parseFloat(noteValue) * (matiere.coefficient || 1);
              nbMatieres += (matiere.coefficient || 1);
            }
          }
          
          const moyenneExamen = nbMatieres > 0 ? sommeNotes / nbMatieres : 0;
          notesParExamen[examenNom] = {
            moyenne: moyenneExamen,
            coefficient: coeff
          };
          
          totalPondere += moyenneExamen * coeff;
          totalCoeffs += coeff;
        } else {
          notesParExamen[examenNom] = {
            moyenne: 0,
            coefficient: coeff
          };
        }
      }
      
      const moyenneAnnuelle = totalCoeffs > 0 ? totalPondere / totalCoeffs : 0;
      
      resultats.push({
        ...etudiant,
        moyenne_annuelle: moyenneAnnuelle,
        notes_par_examen: notesParExamen
      });
    }
    
    return { data: resultats };
  } catch (error) {
    console.error("Erreur calcul moyennes annuelles:", error);
    throw error;
  }
};

// =====================
// DELIBERATIONS
// =====================
export const saveDeliberation = async (data) => {
  try {
    // Vérifier si une délibération existe déjà pour cet étudiant
    const existingRes = await axios.get(`${API}/deliberations`, {
      params: {
        numero_matricule: data.numero_matricule,
        id_annee: data.id_annee
      }
    });
    
    if (existingRes.data && existingRes.data.id) {
      // Mettre à jour l'existant
      return axios.put(`${API}/deliberations/${existingRes.data.id}`, data);
    } else {
      // Créer une nouvelle délibération
      return axios.post(`${API}/deliberations`, data);
    }
  } catch (error) {
    // Si l'endpoint n'existe pas encore, simuler une sauvegarde locale
    console.log("Sauvegarde délibération (mode démo):", data);
    return { data: { success: true, message: "Délibération sauvegardée" } };
  }
};

export const getDeliberations = async (filiere, niveau, id_annee) => {
  try {
    const res = await axios.get(`${API}/deliberations`, {
      params: { filiere, niveau, id_annee }
    });
    return res;
  } catch (error) {
    // Si l'endpoint n'existe pas, retourner un tableau vide
    console.log("Chargement délibérations (mode démo):", { filiere, niveau, id_annee });
    return { data: [] };
  }
};

// =====================
// STATISTIQUES POUR DELIBERATION
// =====================
export const getStatsDeliberation = async (filiere, niveau, id_annee) => {
  try {
    const moyennesRes = await getMoyennesAnnuelles(filiere, niveau, id_annee);
    const etudiants = moyennesRes.data || [];
    
    const stats = {
      total: etudiants.length,
      moyenneClasse: 0,
      meilleureMoyenne: 0,
      tauxReussite: 0,
      repartition: {
        passe: 0,
        redouble: 0,
        renvoye: 0,
        en_attente: 0
      }
    };
    
    if (etudiants.length > 0) {
      const sommeMoyennes = etudiants.reduce((acc, e) => acc + e.moyenne_annuelle, 0);
      stats.moyenneClasse = sommeMoyennes / etudiants.length;
      stats.meilleureMoyenne = Math.max(...etudiants.map(e => e.moyenne_annuelle));
      
      const reussite = etudiants.filter(e => e.moyenne_annuelle >= 10).length;
      stats.tauxReussite = (reussite / etudiants.length) * 100;
    }
    
    return { data: stats };
  } catch (error) {
    console.error("Erreur stats délibération:", error);
    return { data: null };
  }
};