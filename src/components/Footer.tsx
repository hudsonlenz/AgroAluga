import { Tractor } from "lucide-react";
import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 font-heading text-xl font-bold mb-3">
            <Tractor className="h-6 w-6 text-accent" />
            AgroAluga
          </div>
          <p className="text-sm opacity-80">
            Alugue o que precisa. Anuncie o que tem. O agronegócio mais conectado começa aqui.
          </p>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3 text-accent">Plataforma</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/" className="hover:text-accent transition-colors">Buscar Equipamentos</Link></li>
            <li><Link to="/?type=servico" className="hover:text-accent transition-colors">Buscar Serviços</Link></li>
            <li><Link to="/criar-anuncio" className="hover:text-accent transition-colors">Anunciar Gratuitamente</Link></li>
            <li><Link to="/como-funciona" className="hover:text-accent transition-colors">Como Funciona</Link></li>
            <li><Link to="/beneficios" className="hover:text-accent transition-colors">Benefícios</Link></li>
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
      <div className="container mx-auto px-4 mt-8 pt-6 border-t border-primary-medium flex flex-col md:flex-row items-center justify-between gap-2 text-sm opacity-60">
        <span>© 2026 AgroAluga. Todos os direitos reservados.</span>
        <div className="flex gap-4">
          <Link to="/termos" className="hover:text-accent transition-colors">Termos de Uso</Link>
          <Link to="/privacidade" className="hover:text-accent transition-colors">Política de Privacidade</Link>
        </div>
      </div>
    </footer>
  );
}
