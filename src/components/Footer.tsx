import { Tractor } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 font-heading text-xl font-bold mb-3">
            <Tractor className="h-6 w-6 text-accent" />
            AgroAluga
          </div>
          <p className="text-sm opacity-80">Conectando produtores rurais a serviços e equipamentos agrícolas na sua região.</p>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3 text-accent">Plataforma</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/busca" className="hover:text-accent">Buscar Equipamentos</Link></li>
            <li><Link to="/cadastro" className="hover:text-accent">Cadastrar</Link></li>
            <li><Link to="/login" className="hover:text-accent">Entrar</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3 text-accent">Categorias</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>Aluguel de Trator</li>
            <li>Colheitadeira</li>
            <li>Pulverizador</li>
            <li>Irrigação</li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3 text-accent">Contato</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>contato@agroaluga.com.br</li>
            <li>(11) 99999-0000</li>
            <li>São Paulo, SP</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-6 border-t border-primary-medium text-center text-sm opacity-60">
        © 2026 AgroAluga. Todos os direitos reservados.
      </div>
    </footer>
  );
}
