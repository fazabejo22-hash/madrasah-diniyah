import { AppUserAccount, Santri, SiswaMuhafadzoh, SesiAbsensi, HariLiburItem, KritikSaranItem } from './types';
import { DATA_SISWA_247 } from './students247Data';
import { storageService as legacyStorageService, SignaturesConfig } from './storageService';

export type { SignaturesConfig } from './storageService';

const PROD_ACCOUNTS_KEY = 'annajiyah_prod_accounts_v1';
const PREFIX = 'annajiyah_v2_';
const KEYS = {
  tahun: `${PREFIX}tahun_ajaran`, semester: `${PREFIX}semester`, daftarTahun: `${PREFIX}daftar_tahun`,
  muhaf: `${PREFIX}muhafadzoh_list`, absensi: `${PREFIX}absensi_session`, libur: `${PREFIX}daftar_libur`,
  kritik: `${PREFIX}kritik_saran_list`, signatures: `${PREFIX}signatures_musrif`, settings: `${PREFIX}settings`,
};
const readJson=<T,>(key:string,fallback:T):T=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw) as T:fallback}catch{return fallback}};
const writeJson=(key:string,value:unknown)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};

const readAccounts = (): AppUserAccount[] => readJson<AppUserAccount[]>(PROD_ACCOUNTS_KEY, []);
const writeAccounts = (accounts: AppUserAccount[]) => writeJson(PROD_ACCOUNTS_KEY, accounts);

const sanitizeExtra = (s?: Santri | null): Partial<Santri> => {
  if (!s) return {};
  const fakeNisn = s.nisn === `00${s.nis}88`;
  const fakeBirthPlace = s.tempatLahir === 'Jombang';
  const fakeBirthDate = s.tanggalLahir === '10 Muharram 1430 H';
  const fakeGuardian = s.waliSantri === `Wali dari ${s.nama}` || s.namaWali === `Wali dari ${s.nama}`;
  const fakePhone = s.noHpWali === '0812-3456-7890';
  const fakeAddress = s.alamat === 'Tambakberas, Jombang';
  const fakePhoto = Boolean(s.foto && s.foto.includes('images.unsplash.com'));
  const fakeAcademicNote = Boolean(s.catatanWaliKelas && (s.catatanWaliKelas.includes('Santri berakhlakul karimah') || s.catatanWaliKelas.includes('Calon wisudawan teladan')));
  return {
    nisn: fakeNisn ? '' : s.nisn, tempatLahir: fakeBirthPlace ? '' : s.tempatLahir,
    tanggalLahir: fakeBirthDate ? '' : s.tanggalLahir, namaWali: fakeGuardian ? '' : s.namaWali,
    waliSantri: fakeGuardian ? '' : s.waliSantri, noHpWali: fakePhone ? '' : s.noHpWali,
    alamat: fakeAddress ? '' : s.alamat, foto: fakePhoto ? '' : s.foto, kamarAsrama:s.kamarAsrama,
    tahunMasuk:s.tahunMasuk, prestasi:s.prestasi, pelanggaran:s.pelanggaran, waliKelas:s.waliKelas,
    catatanWaliKelas:fakeAcademicNote?'':s.catatanWaliKelas, hafalanJuz:undefined, mutqinSurah:undefined,
    kehadiranPercent:s.kehadiranPercent===96.5?undefined:s.kehadiranPercent,
    rataRataNilai:s.rataRataNilai===88.5?undefined:s.rataRataNilai,
    akhlakPredikat:s.akhlakPredikat==='Jayyid Jiddan'?undefined:s.akhlakPredikat,
  };
};

const officialBase = (): Santri[] => {
  let persisted: Santri[] = [];
  try { persisted = legacyStorageService.getSantriList(); } catch { persisted = []; }
  const persistedByNis = new Map(persisted.map((s) => [s.nis, s]));
  const officialNis = new Set(DATA_SISWA_247.map((s) => s.nis));
  const official = DATA_SISWA_247.map((src) => {
    const extra = sanitizeExtra(persistedByNis.get(src.nis));
    return { id:`santri-${src.nis}`,nis:src.nis,nisn:'',nama:src.nama,gender:src.jk,jenisKelamin:src.jk,kelas:src.kelas,status:src.status as any,tempatLahir:'',tanggalLahir:'',namaWali:'',waliSantri:'',noHpWali:'',alamat:'',foto:'',...extra,nis:src.nis,nama:src.nama,gender:src.jk,jenisKelamin:src.jk,kelas:src.kelas,status:src.status as any } as Santri;
  });
  const custom=persisted.filter(s=>!officialNis.has(s.nis)).map(s=>({...s,...sanitizeExtra(s),hafalanJuz:undefined,mutqinSurah:undefined}));
  return [...official,...custom];
};

const emptyAbsensiSession=():SesiAbsensi=>({id:'',tanggal:'',kelas:'',mataPelajaran:'',jamKe:'',ruang:'',guruPengampu:'',isCompleted:false,records:[]});
const emptySignatures=():SignaturesConfig=>({namaPengasuh:'',jabatanPengasuh:'',namaKepalaMadrasah:'',titimangsaRaport:'',tanggalHijriahRaport:'',titimangsaIjazah:'',tanggalHijriahIjazah:'',nomorIjazahTemplate:'',catatanRaportDefault:'',keputusanLulusDefault:'',musrifPerKelas:{},signatureImageUrl:''});

const readMuhaf=():SiswaMuhafadzoh[]=>{
  const persisted=readJson<SiswaMuhafadzoh[]>(KEYS.muhaf,[]);
  const byNis=new Map(persisted.map(x=>[x.nis,x]));
  return DATA_SISWA_247.map(src=>{
    const p=byNis.get(src.nis);
    if(!p)return {...src};
    return {...src,
      capaian1:p.capaian1??null,capaian2:p.capaian2??null,capaian3:p.capaian3??null,capaian4:p.capaian4??null,
      capaian5:p.capaian5??null,capaian6:p.capaian6??null,capaian7:p.capaian7??null,capaian8:p.capaian8??null,
      ujianTulisS1:p.ujianTulisS1??null,ujianTulisS2:p.ujianTulisS2??null,ujianLisanS1:p.ujianLisanS1??null,ujianLisanS2:p.ujianLisanS2??null,
      kehadiran:p.kehadiran??null,catatan:p.catatan||'',
      nilaiUjianMuhafadzoh:(p.nilaiUjianMuhafadzoh===88&&!['capaian1','capaian2','capaian3','capaian4','capaian5','capaian6','capaian7','capaian8'].some(k=>Number((p as any)[k])>0))?undefined:p.nilaiUjianMuhafadzoh,
      nilaiMuhafadzoh:(p.nilaiMuhafadzoh===88?undefined:p.nilaiMuhafadzoh),
    };
  });
};

export const storageService = {
  ...legacyStorageService,
  getTahunAjaran():string { return readJson<string>(KEYS.tahun,'2026/2027'); },
  saveTahunAjaran(tahun:string):void { writeJson(KEYS.tahun,tahun); },
  getSemester():'Ganjil'|'Genap' { return readJson<'Ganjil'|'Genap'>(KEYS.semester,'Ganjil'); },
  saveSemester(semester:'Ganjil'|'Genap'):void { writeJson(KEYS.semester,semester); },
  getDaftarTahunAjaran():string[] { return readJson<string[]>(KEYS.daftarTahun,['2026/2027']); },
  saveDaftarTahunAjaran(list:string[]):void { writeJson(KEYS.daftarTahun,list); },

  getSantriList():Santri[]{return officialBase();}, getStudents():Santri[]{return this.getSantriList();},
  saveSantriList(list:Santri[]):void{legacyStorageService.saveSantriList(list);}, saveStudents(list:Santri[]):void{this.saveSantriList(list);},
  updateSantri(id:string,updates:Partial<Santri>):void{legacyStorageService.saveSantriList(this.getSantriList().map(s=>s.id===id?{...s,...updates}:s));},
  deleteSantri(id:string):void{legacyStorageService.saveSantriList(this.getSantriList().filter(s=>s.id!==id));},

  getMuhafadzohList():SiswaMuhafadzoh[]{return readMuhaf();},
  saveMuhafadzohList(list:SiswaMuhafadzoh[]):void{writeJson(KEYS.muhaf,list);},
  updateSingleSiswaMuhafadzoh(updated:SiswaMuhafadzoh):SiswaMuhafadzoh[]{const list=readMuhaf();const next=list.map(s=>s.nis===updated.nis?updated:s);writeJson(KEYS.muhaf,next);return next;},

  getAbsensiSession():SesiAbsensi{return readJson<SesiAbsensi>(KEYS.absensi,emptyAbsensiSession());},
  saveAbsensiSession(session:SesiAbsensi):void{writeJson(KEYS.absensi,session);},
  getDaftarLibur():HariLiburItem[]{return readJson<HariLiburItem[]>(KEYS.libur,[]);}, getHariLibur():HariLiburItem[]{return this.getDaftarLibur();},
  saveDaftarLibur(list:HariLiburItem[]):void{writeJson(KEYS.libur,list);},
  addHariLibur(item:Omit<HariLiburItem,'id'|'dibuatPada'>):HariLiburItem[]{const next=[{...item,id:`libur-${Date.now()}`,dibuatPada:new Date().toISOString().slice(0,10)},...this.getDaftarLibur()];this.saveDaftarLibur(next);return next;},
  deleteHariLibur(id:string):HariLiburItem[]{const next=this.getDaftarLibur().filter(x=>x.id!==id);this.saveDaftarLibur(next);return next;},
  isTanggalLibur(dateStr:string):{isLibur:boolean;keterangan?:string}{const hit=this.getDaftarLibur().find(x=>dateStr>=x.tanggalMulai&&dateStr<=x.tanggalSelesai);return hit?{isLibur:true,keterangan:hit.keterangan}:{isLibur:false};},
  getKritikSaran():KritikSaranItem[]{return readJson<KritikSaranItem[]>(KEYS.kritik,[]);},
  saveKritikSaran(items:KritikSaranItem[]):void{writeJson(KEYS.kritik,items);},

  getSignaturesAndMusrif():SignaturesConfig{return readJson<SignaturesConfig>(KEYS.signatures,emptySignatures());},
  saveSignaturesAndMusrif(config:SignaturesConfig):void{writeJson(KEYS.signatures,config);},
  getAppSettings():{namaPesantren:string;nspp:string;alamat:string}{return readJson(KEYS.settings,{namaPesantren:'Madrasah Diniyyah Takmiliyyah An-Najiyah 2',nspp:'',alamat:''});},
  saveAppSettings(settings:{namaPesantren:string;nspp:string;alamat:string}):void{writeJson(KEYS.settings,settings);},

  getUserAccounts():AppUserAccount[]{return readAccounts();}, saveUserAccounts(accounts:AppUserAccount[]):void{writeAccounts(accounts);}, addUserAccount(account:AppUserAccount):void{writeAccounts([account,...readAccounts()]);},
  updateUserAccount(id:string,updates:Partial<AppUserAccount>):void{writeAccounts(readAccounts().map(a=>a.id===id?{...a,...updates}:a));}, deleteUserAccount(id:string):void{writeAccounts(readAccounts().filter(a=>a.id!==id));},
  changeUserPassword(idOrUsername:string,newPass:string):boolean{let changed=false;const key=idOrUsername.trim().toLowerCase();const updated=readAccounts().map(a=>{if(a.id.toLowerCase()===key||a.username.toLowerCase()===key||a.nipOrNis.replace(/\W/g,'').toLowerCase()===key.replace(/\W/g,'')){changed=true;return{...a,password:newPass}}return a});if(changed)writeAccounts(updated);return changed;},
  verifyLogin(username:string,pass:string):AppUserAccount|null{const user=username.trim().toLowerCase();return readAccounts().find(a=>a.status==='Aktif'&&a.password===pass&&(a.username.toLowerCase()===user||a.nipOrNis.replace(/\W/g,'').toLowerCase()===user.replace(/\W/g,'')))||null;},
};
