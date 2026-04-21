import { Tractor, Heart, X, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const PIX_KEY = "6888411d-85de-4cca-81a5-40a2f8e81695";
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(PIX_KEY)}`;

export default function Footer() {
  const [showPix, setShowPix] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 font-heading text-xl font-bold mb-3">
            <Tractor className="h-6 w-6 text-accent" />
            AgroAluga
          </div>
          <p className="text-sm opacity-80">
            Alugue o que precisa. Anuncie o que tem. O agronegocio mais conectado comeca aqui.
          </p>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3 text-accent">Plataforma</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/" className="hover:text-accent transition-colors">Buscar Equipamentos</Link></li>
            <li><Link to="/?type=servico" className="hover:text-accent transition-colors">Buscar Servicos</Link></li>
            <li><Link to="/criar-anuncio" className="hover:text-accent transition-colors">Anunciar Gratuitamente</Link></li>
            <li><Link to="/como-funciona" className="hover:text-accent transition-colors">Como Funciona</Link></li>
            <li><Link to="/beneficios" className="hover:text-accent transition-colors">Beneficios</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3 text-accent">Contato</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>
              <a href="mailto:agroaluga@outlook.com" className="hover:text-accent transition-colors">
                agroaluga@outlook.com
              </a>
            </li>
            <li>Santa Catarina, Brasil</li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 pt-6 border-t border-primary-medium flex flex-col md:flex-row items-center justify-between gap-4 text-sm opacity-60">
        <span>© 2026 AgroAluga. Todos os direitos reservados.</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowPix(true)}
            className="flex items-center gap-1.5 text-accent hover:text-accent/80 transition-colors font-medium opacity-100"
          >
            <Heart className="h-3.5 w-3.5" /> Apoie o AgroAluga
          </button>
          <span>|</span>
          <Link to="/termos" className="hover:text-accent transition-colors">Termos de Uso</Link>
          <Link to="/privacidade" className="hover:text-accent transition-colors">Politica de Privacidade</Link>
        </div>
      </div>

      {/* Modal PIX */}
      {showPix && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
          onClick={() => setShowPix(false)}
        >
          <div
            className="bg-card text-card-foreground rounded-2xl p-8 max-w-sm w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPix(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-destructive fill-destructive" />
                <h2 className="text-xl font-heading font-bold">Apoie o AgroAluga</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Sua doacao ajuda a manter a plataforma gratuita e conectar mais produtores rurais no Brasil.
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-white rounded-xl border border-border">
                <img
                  src={QR_URL}
                  alt="QR Code PIX"
                  width={180}
                  height={180}
                />
              </div>
            </div>

            {/* Chave PIX */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground text-center mb-2">Ou copie a chave PIX</p>
              <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
                <span className="text-xs font-mono flex-1 truncate text-muted-foreground">{PIX_KEY}</span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 text-primary hover:text-primary/80 transition-colors"
                  title="Copiar chave PIX"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 text-center mt-1">Chave copiada!</p>
              )}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Muito obrigado pelo seu apoio! <Heart className="h-3.5 w-3.5 inline text-destructive fill-destructive" />
            </p>
          </div>
        </div>
      )}
    </footer>
  );
}
