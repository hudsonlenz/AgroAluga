import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export interface Listing {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  priceUnit: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  images: string[];
  availability: string[];
  phone: string;
  whatsapp: string;
  email: string;
  ownerId: string;
  ownerName: string;
  featured: boolean;
  status: "active" | "expired" | "pending" | "paused" | "rejected";
  views: number;
  contactsRevealed: number;
  createdAt: string;
  latitude?: number;
  longitude?: number;
}

export interface User {
  avatarUrl?: string | null;
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  accountType: "contractor" | "provider";
  blocked?: boolean;
}

export interface Review {
  id: string;
  listingId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface AuthError { message: string; }

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  state: string;
  accountType: "contractor" | "provider";
}

interface AppState {
  user: User | null;
  session: Session | null;
  listings: Listing[];
  reviews: Review[];
  revealedContacts: string[];
  authLoading: boolean;
  listingsLoading: boolean;
  login: (email: string, password: string) => Promise<AuthError | null>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<AuthError | null>;
  revealContact: (listingId: string) => void;
  addListing: (listing: Omit<Listing, "id" | "views" | "contactsRevealed" | "createdAt" | "rating" | "reviewCount">) => Promise<void>;
  updateListing: (id: string, data: Partial<Listing>) => void;
}

export const EQUIPMENT_CATEGORIES = [
  "Tratores e Implementos",
  "Colheitadeiras",
  "Plantadeiras e Semeadoras",
  "Pulverizadores",
  "Caminhoes e Transporte",
  "Irrigacao e Bombeamento",
  "Drones Agricolas",
  "Ferramentas Eletricas",
  "Motosserras e Rocadeiras",
  "Ferramentas Manuais",
  "Equipamentos de Seguranca",
  "Geradores e Compressores",
  "Outros Equipamentos",
];

export const SERVICE_CATEGORIES = [
  "Operador + Maquina",
  "Manutencao de Implementos",
  "Fotografia e Mapeamento Aereo",
  "Coleta de Amostras de Solo",
  "Analise e Consultoria Agricola",
  "Aplicacao de Defensivos",
  "Instalacao de Irrigacao",
  "Servicos Veterinarios",
  "Transporte de Animais",
  "Cercamento e Terraplanagem",
  "Armazenagem de Graos",
  "Outros Servicos",
];

export const CATEGORIES = [...EQUIPMENT_CATEGORIES, ...SERVICE_CATEGORIES];

const AppContext = createContext<AppState | undefined>(undefined);


export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews] = useState<Review[]>([]);
  const [revealedContacts, setRevealedContacts] = useState<string[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  // Log de acesso
  async function logSessionEvent(userId: string, event: string) {
    try {
      await supabase.from("session_logs").insert({
        user_id: userId,
        event,
        user_agent: navigator.userAgent,
      });
    } catch {}
  }

  // Sessao unica - invalida outras sessoes ao fazer login
  async function enforceUniqueSession(userId: string) {
    try {
      await supabase.from("profiles")
        .update({ last_session_at: new Date().toISOString() })
        .eq("id", userId);
    } catch {}
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
        const loginTime = new Date(session.user.last_sign_in_at || Date.now()).getTime();
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    fetchListings();
    const channel = supabase
      .channel("listings-changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "listings" }, () => fetchListings())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "listings" }, () => fetchListings())
      .subscribe();
    const handleFocus = () => fetchListings();
    window.addEventListener("focus", handleFocus);
    return () => { supabase.removeChannel(channel); window.removeEventListener("focus", handleFocus); };
  }, []);

  async function fetchListings() {
    setListingsLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .in("status", ["active", "paused", "pending", "rejected"])
      .order("created_at", { ascending: false });
    if (!error && data) {
      setListings(data.map(mapListing));
    }
    setListingsLoading(false);
  }

  function mapListing(row: any): Listing {
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      description: row.description || "",
      price: row.price,
      priceUnit: row.price_unit,
      city: row.city,
      state: row.state,
      rating: 0,
      reviewCount: 0,
      images: row.images || [],
      availability: row.availability || [],
      phone: row.phone || "",
      whatsapp: row.whatsapp || "",
      email: row.email || "",
      ownerId: row.owner_id,
      ownerName: row.owner_name,
      featured: row.featured || false,
      status: row.status,
      views: row.views || 0,
      contactsRevealed: row.contacts_revealed || 0,
      createdAt: row.created_at,
      listingType: row.listing_type,
      latitude: row.latitude,
      longitude: row.longitude,
    };
  }

  function mapSupabaseUser(u: NonNullable<Session["user"]>): User {
    const m = u.user_metadata || {};
    return {
      id: u.id,
      name: m.name || u.email?.split("@")[0] || "Usuario",
      email: u.email || "",
      phone: m.phone || "",
      city: m.city || "",
      state: m.state || "",
      accountType: m.accountType || "contractor",
      blocked: false,
    };
  }

  function traduzirErro(msg: string): string {
    if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
    if (msg.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
    if (msg.includes("User already registered")) return "Este e-mail ja esta cadastrado.";
    if (msg.includes("Password should be at least")) return "A senha deve ter no minimo 6 caracteres.";
    return "Ocorreu um erro. Tente novamente.";
  }

  const login = async (email: string, password: string): Promise<AuthError | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { message: traduzirErro(error.message) };
    if (data.user) {
      await logSessionEvent(data.user.id, "login");
      await enforceUniqueSession(data.user.id);
    }
    return null;
  };

  const logout = async () => {
    if (user) await logSessionEvent(user.id, "logout_manual");
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const register = async (data: RegisterData): Promise<AuthError | null> => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name, phone: data.phone, city: data.city, state: data.state, accountType: data.accountType } },
    });
    return error ? { message: traduzirErro(error.message) } : null;
  };

  const revealContact = (listingId: string) => setRevealedContacts((prev) => [...prev, listingId]);

  const addListing = async (data: Omit<Listing, "id" | "views" | "contactsRevealed" | "createdAt" | "rating" | "reviewCount">) => {
    if (!user) return;
    const { data: inserted, error } = await supabase.from("listings").insert({
      owner_id: user.id,
      owner_name: user.name,
      title: data.title,
      category: data.category,
      description: data.description,
      price: data.price,
      price_unit: data.priceUnit,
      city: data.city,
      state: data.state,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
      availability: data.availability,
      images: data.images,
      featured: data.featured,
      status: data.status,
      listing_type: (data as any).listingType || "equipamento",
      latitude: (data as any).latitude,
      longitude: (data as any).longitude,
    }).select().single();
    if (!error && inserted) {
      setListings((prev) => [mapListing(inserted), ...prev]);
    }
  };

  const updateListing = (id: string, data: Partial<Listing>) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
  };

  return (
    <AppContext.Provider value={{ user, session, listings, reviews, revealedContacts, authLoading, listingsLoading, login, logout, register, revealContact, addListing, updateListing, setUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
