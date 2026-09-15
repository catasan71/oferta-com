import React, { useState } from 'react';
import { X, Shield, FileText, Lock, Cookie, ExternalLink, Printer } from 'lucide-react';

export type LegalTab = 'TERMS' | 'GDPR' | 'COOKIES';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'TERMS',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Antet Modal */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Informații Legale & Conformitate
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                OfferFlow SaaS B2B • Legislație România & Uniunea Europeană (eIDAS, GDPR)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Tipărește documentul"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Tipărește</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab-uri Navigare */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('TERMS')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'TERMS'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Termeni și Condiții
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GDPR')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'GDPR'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            Politica de Confidențialitate (GDPR)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COOKIES')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'COOKIES'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Cookie className="w-4 h-4" />
            Politica Cookies
          </button>
        </div>

        {/* Conținut Tab activ */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-4">
          {activeTab === 'TERMS' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4 text-blue-900 dark:text-blue-200 text-xs">
                <strong>Ultima actualizare:</strong> 15 Septembrie 2026. Acest document reprezintă acordul juridic dintre dumneavoastră și operatorul platformei <strong>OfferFlow</strong> pentru utilizarea serviciului B2B de generare, transmitere și semnare digitală a ofertelor comerciale.
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                1. Dispoziții Generale și Identificarea Operatorului
              </h4>
              <p>
                Platforma <strong>OfferFlow</strong> este o soluție software ca serviciu (SaaS B2B) dezvoltată și operată legal de către <strong>Catalin Sandu PFA</strong>, având Codul Unic de Înregistrare (CUI): <strong>54552543</strong>, cu sediul în <strong>Craiova, România</strong>.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div><strong>Operator:</strong> Catalin Sandu PFA • CUI: 54552543</div>
                <div><strong>Sediu:</strong> Craiova, România</div>
                <div><strong>Email contact & suport:</strong> <a href="mailto:office@developly.pro" className="text-blue-600 dark:text-blue-400 underline">office@developly.pro</a></div>
                <div><strong>Telefon:</strong> <a href="tel:0765263860" className="text-blue-600 dark:text-blue-400">0765263860</a></div>
              </div>
              <p className="pt-1">
                Serviciul este destinat profesioniștilor, persoanelor fizice autorizate și societăților comerciale pentru:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>Crearea, gestionarea și structurarea ofertelor comerciale, devizelor și propunerilor de afaceri;</li>
                <li>Gestiunea unui catalog centralizat de produse, echipamente, manoperă și servicii recurente;</li>
                <li>Transmiterea securizată a ofertelor prin link unic web criptat către clienții destinatari;</li>
                <li>Negocierea interactivă prin selecția sau deselectarea articolelor opționale cu recalculare automată în timp real;</li>
                <li>Semnarea electronică simplă și avansată a ofertelor comerciale direct pe ecran tactil sau desktop, cu generarea certificatului de trasabilitate.</li>
              </ul>

              <h4 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                2. Valoarea Juridică a Semnăturilor Digitale (eIDAS & Legea 455/2001)
              </h4>
              <p>
                Semnăturile electronice capturate prin intermediul platformei OfferFlow respectă principiile <strong>Regulamentului European (UE) nr. 910/2014 (eIDAS)</strong> privind identificarea electronică și serviciile de încredere pentru tranzacțiile electronice pe piața internă, precum și dispozițiile <strong>Legii nr. 455/2001</strong> din România și ale <strong>O.U.G. nr. 38/2020</strong>.
              </p>
              <p>
                La momentul semnării de către client, platforma înregistrează în mod automat date de trasabilitate: adresa IP de conectare, amprenta browserului (User-Agent), timestamp-ul exact în format UTC, identificatorul unic al ofertei și starea exactă a articolelor acceptate, generând un rezumat de audit descărcabil. Părțile convin în mod expres că acest mecanism constituie o dovadă valabilă a consimțământului comercial exprimat între profesioniști.
              </p>

              <h4 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                3. Pachete de Abonament și Modalități de Plată
              </h4>
              <p>Serviciul este structurat pe trei niveluri de utilizare:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li><strong>Pachetul FREE:</strong> Gratuit, include emiterea a maxim 2 oferte comerciale active, catalog de bază și semnare digitală;</li>
                <li><strong>Pachetul STARTER:</strong> 45 RON / lună, include emiterea a maxim 5 oferte comerciale active, eliminarea watermark-ului OfferFlow (white-label complet), personalizare logo și culori proprii;</li>
                <li><strong>Pachetul CLASIC:</strong> 100 RON / lună, include emiterea a maxim 30 oferte comerciale active, catalog extins, suport dedicat și trasabilitate avansată eIDAS.</li>
              </ul>
              <p>
                Plățile sunt procesate în condiții de maximă securitate prin intermediul procesatorului autorizat <strong>Revolut Merchant Services</strong> sau card bancar 3D-Secure. Abonamentele se pot reînnoi lunar sau pot fi anulate în orice moment direct din contul de utilizator, fără penalități.
              </p>

              <h4 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                4. Răspunderea Utilizatorului și Proprietate Intelectuală
              </h4>
              <p>
                Utilizatorul este unic responsabil pentru corectitudinea datelor fiscale, a prețurilor, cotelor de TVA aplicate și a termenilor contractuali inserați în ofertele create. OfferFlow nu intervine în relația comercială dintre utilizator și clienții săi și nu oferă consultanță juridică sau contabilă.
              </p>
              <p>
                Toate elementele de design, codul sursă, mărcile și algoritmii platformei OfferFlow aparțin exclusiv operatorului. Datele introduse de utilizator (logo, liste de prețuri, date clienți) rămân proprietatea exclusivă a utilizatorului.
              </p>
            </div>
          )}

          {activeTab === 'GDPR' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4 text-emerald-900 dark:text-emerald-200 text-xs">
                <strong>Conformitate GDPR:</strong> Prelucrarea datelor cu caracter personal se realizează în strictă conformitate cu <strong>Regulamentul (UE) 2016/679 (GDPR)</strong> și Legea nr. 190/2018 din România.
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                1. Operatorul de Date și Datele de Contact
              </h4>
              <p>
                Operatorul responsabil de prelucrarea datelor cu caracter personal în cadrul platformei OfferFlow este <strong>Catalin Sandu PFA</strong>, având Codul Unic de Înregistrare (CUI): <strong>54552543</strong>, cu sediul în <strong>Craiova, România</strong>.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div><strong>Operator:</strong> Catalin Sandu PFA • CUI: 54552543</div>
                <div><strong>Sediul:</strong> Craiova, România</div>
                <div><strong>Email protecția datelor (DPO / Suport):</strong> <a href="mailto:office@developly.pro" className="text-blue-600 dark:text-blue-400 underline">office@developly.pro</a></div>
                <div><strong>Telefon:</strong> <a href="tel:0765263860" className="text-blue-600 dark:text-blue-400">0765263860</a></div>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                2. Categorii de Date Prelucrate
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li><strong>Date ale Utilizatorilor Înregistrați:</strong> Nume, prenume, denumire companie, cod fiscal (CUI/CIF), număr de înregistrare la Registrul Comerțului, adresă sediu social, email, număr de telefon, credențiale de autentificare criptate;</li>
                <li><strong>Date ale Destinatarilor Ofertelor (Clienți):</strong> Nume reprezentant, denumire companie parteneră, email și număr de telefon furnizate de utilizator pentru transmiterea ofertei;</li>
                <li><strong>Date Tehnice de Audit și Semnare:</strong> Semnătura grafică trasată, adresa IP a semnatarului, identificatorul browserului (User Agent), timestamp-ul exact al vizualizării și semnării.</li>
              </ul>

              <h4 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                3. Temeiul și Scopurile Prelucrării
              </h4>
              <p>Datele sunt prelucrate pe baza următoarelor temeiuri juridice:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li><strong>Executarea contractului (Art. 6 alin. 1 lit. b GDPR):</strong> Furnizarea accesului la platformă, generarea ofertelor și facilitarea semnăturii digitale;</li>
                <li><strong>Îndeplinirea obligațiilor legale (Art. 6 alin. 1 lit. c GDPR):</strong> Facturare fiscală și arhivarea documentelor justificative;</li>
                <li><strong>Interes legitim (Art. 6 alin. 1 lit. f GDPR):</strong> Prevenirea fraudelor, asigurarea securității cibernetice și dovedirea consimțământului la semnare conform eIDAS.</li>
              </ul>

              <h4 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                4. Drepturile Dumneavoastră conform GDPR
              </h4>
              <p>Conform legislației europene, beneficiați de:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>Dreptul de acces la datele prelucrate;</li>
                <li>Dreptul la rectificarea datelor inexacte sau incomplete;</li>
                <li>Dreptul la ștergerea datelor („dreptul de a fi uitat”), în limitele permise de legislația fiscală;</li>
                <li>Dreptul la restricționarea prelucrării;</li>
                <li>Dreptul la portabilitatea datelor într-un format structurat;</li>
                <li>Dreptul de a depune o plângere în fața <strong>Autorității Naționale de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong> din România (www.dataprotection.ro).</li>
              </ul>
            </div>
          )}

          {activeTab === 'COOKIES' && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 text-amber-900 dark:text-amber-200 text-xs">
                <strong>Politica de Cookies:</strong> OfferFlow utilizează un număr minim de fișiere cookie strict necesare pentru funcționarea securizată a platformei și memorarea preferințelor de sesiune.
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                1. Ce este un fișier Cookie?
              </h4>
              <p>
                Un cookie este un fișier text de mici dimensiuni salvat pe dispozitivul dumneavoastră (calculator, tabletă sau telefon) atunci când vizitați un site web. Acesta permite site-ului să rețină acțiunile și preferințele dumneavoastră (cum ar fi autentificarea, limba sau tema selectată) pe o perioadă de timp.
              </p>

              <h4 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                2. Tipurile de Cookie-uri Utilizate de OfferFlow
              </h4>
              <div className="space-y-3">
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
                  <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">Strict Necesare</span>
                  <h5 className="font-semibold text-slate-900 dark:text-white text-xs mt-1">Cookie-uri de sesiune & autentificare</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Esențiale pentru a vă menține logat în mod securizat în aplicație și a proteja formularele împotriva atacurilor de tip CSRF. Acestea nu pot fi dezactivate.
                  </p>
                </div>

                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
                  <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Preferințe & Funcționalitate</span>
                  <h5 className="font-semibold text-slate-900 dark:text-white text-xs mt-1">Stocare Temă & Configurație (LocalStorage)</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Memorează tema vizuală aleasă (Slate, Dark, Warm, etc.) și preferințele dumneavoastră de afișare pentru o experiență optimă la fiecare revenire.
                  </p>
                </div>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                3. Cum puteți controla modulele Cookie?
              </h4>
              <p>
                Puteți controla și/sau șterge modulele cookie după cum doriți direct din setările browserului dumneavoastră (Chrome, Safari, Firefox, Edge). Dacă blocați complet cookie-urile strict necesare, anumite funcții ale contului de utilizator nu vor putea funcționa corespunzător.
              </p>

              <h4 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                4. Întrebări & Contact privind Cookie-urile
              </h4>
              <p>
                Pentru orice clarificări legate de utilizarea fișierelor cookie pe platforma OfferFlow, operatorul <strong>Catalin Sandu PFA</strong> vă stă la dispoziție:
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div><strong>Operator:</strong> Catalin Sandu PFA • CUI: 54552543 • Craiova, România</div>
                <div><strong>Email:</strong> <a href="mailto:office@developly.pro" className="text-blue-600 dark:text-blue-400 underline">office@developly.pro</a></div>
                <div><strong>Telefon:</strong> <a href="tel:0765263860" className="text-blue-600 dark:text-blue-400">0765263860</a></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>OfferFlow B2B • Toate drepturile rezervate</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors cursor-pointer"
          >
            Am Înțeles
          </button>
        </div>
      </div>
    </div>
  );
};
