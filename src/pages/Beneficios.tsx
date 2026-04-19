import { Link } from "react-router-dom";
import { MapPin, ShieldCheck, Clock, Banknote, Star, Headphones, TrendingUp, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Beneficios() {
  return (
    <div className="bg-background">

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-4xl font-heading font-extrabold mb-4">Benefícios</h1>
          <p className="text-primary-foreground/80 text-lg">
            A AgroAluga foi criada para facilitar a vida de quem trabalha no campo.
            Veja por que somos a plataforma certa para você.
          </p>
        </div>
      </section>

      {/* Benefícios para contratantes */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-heading font-bold text-center mb-2">Para quem contrata</h2>
          <p className="text-center text-muted-foreground mb-12">Vantagens para produtores que buscam equipamentos e serviços</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MapPin, title: "Fornecedores próximos", description: "Encontre equipamentos e serviços disponíveis na sua cidade ou região, reduzindo custos de deslocamento e logística." },
              { icon: Clock, title: "Agilidade na busca", description: "Compare múltiplos fornecedores em minutos, sem precisar ligar para vários lugares ou depender de indicação boca a boca." },
              { icon: Star, title: "Avaliações reais", description: "Acesse avaliações de outros produtores rurais que já contrataram o serviço. Contrate com segurança e confiança." },
              { icon: Banknote, title: "Preços transparentes", description: "Veja os preços diretamente nos anúncios antes de entrar em contato. Sem surpresas na hora de fechar o negócio." },
              { icon: ShieldCheck, title: "Plataforma segura", description: "Seus dados são protegidos e os contatos dos fornecedores ficam disponíveis diretamente na plataforma, sem intermediários." },
              { icon: Headphones, title: "Suporte dedicado", description: "Nossa equipe está disponível para ajudar em caso de dúvidas ou problemas durante a contratação." },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-3 p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-heading font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/busca"><Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8">Buscar agora</Button></Link>
          </div>
        </div>
      </section>

      <div className="bg-secondary h-2" />

      {/* Benefícios para anunciantes */}
      <section className="py-16 px-4 bg-secondary">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-heading font-bold text-center mb-2">Para quem anuncia</h2>
          <p className="text-center text-muted-foreground mb-12">Vantagens para produtores que oferecem equipamentos e serviços</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: "Mais visibilidade", description: "Seu anúncio fica visível para produtores da sua região que estão ativamente buscando o que você oferece." },
              { icon: TrendingUp, title: "Aumente sua renda", description: "Coloque seus equipamentos parados para gerar renda. Alugue nos períodos em que não está utilizando." },
              { icon: Lock, title: "Controle total", description: "Você define preço, disponibilidade e região de atendimento. Nenhum contato é liberado sem sua confirmação." },
              { icon: Star, title: "Construa reputação", description: "Acumule avaliações positivas e se torne referência na sua região. Boa reputação atrai mais clientes." },
              { icon: Banknote, title: "100% gratuito", description: "Criar sua conta e publicar anúncios é totalmente gratuito. Sem mensalidade, sem taxas — anuncie à vontade." },
              { icon: Headphones, title: "Suporte especializado", description: "Conte com o suporte da AgroAluga para tirar dúvidas sobre como anunciar melhor e alcançar mais clientes." },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-3 p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/cadastro"><Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8">Anunciar gratuitamente</Button></Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-4 bg-accent/10 text-center">
        <div className="container mx-auto max-w-xl">
          <h2 className="text-3xl font-heading font-bold mb-4">Pronto para começar?</h2>
          <p className="text-muted-foreground mb-8">
            Junte-se a milhares de produtores rurais que já usam a AgroAluga para facilitar o dia a dia no campo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/busca"><Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8">Buscar equipamentos</Button></Link>
            <Link to="/cadastro"><Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8">Criar conta grátis</Button></Link>
          </div>
        </div>
      </section>

    </div>
  );
}
