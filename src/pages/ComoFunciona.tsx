import { Link } from "react-router-dom";
import { Search, Star, PhoneCall, UserPlus, PlusSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComoFunciona() {
  return (
    <div className="bg-background">

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-4xl font-heading font-extrabold mb-4">Como Funciona</h1>
          <p className="text-primary-foreground/80 text-lg">
            Conectamos produtores rurais e prestadores de serviços agrícolas de forma simples,
            rápida e segura. Veja como é fácil usar a plataforma.
          </p>
        </div>
      </section>

      {/* Para quem contrata */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-heading font-bold text-center mb-2">Para quem contrata</h2>
          <p className="text-center text-muted-foreground mb-12">
            Precisa de um equipamento ou serviço agrícola? Veja como encontrar o que precisa.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, step: "1", title: "Busque", description: "Digite o tipo de serviço ou equipamento que precisa e informe sua cidade ou região. Nossa plataforma mostrará os fornecedores disponíveis perto de você." },
              { icon: Star, step: "2", title: "Compare", description: "Analise os anúncios, veja as avaliações de outros produtores, compare preços e verifique a disponibilidade antes de tomar sua decisão." },
              { icon: PhoneCall, step: "3", title: "Contrate", description: "Escolheu o fornecedor ideal? Libere o contato com um plano simples e feche o negócio diretamente com o produtor da sua região." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center gap-4 p-6 bg-card rounded-xl border border-border shadow-sm">
                <div className="h-14 w-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-heading font-bold text-xl shrink-0">{item.step}</div>
                <item.icon className="h-8 w-8 text-primary" />
                <h3 className="font-heading font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/busca"><Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8">Buscar equipamentos</Button></Link>
          </div>
        </div>
      </section>

      <div className="bg-secondary h-2" />

      {/* Para quem anuncia */}
      <section className="py-16 px-4 bg-secondary">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-heading font-bold text-center mb-2">Para quem anuncia</h2>
          <p className="text-center text-muted-foreground mb-12">
            Tem equipamentos ou presta serviços agrícolas? Anuncie e alcance mais clientes.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: UserPlus, step: "1", title: "Cadastre", description: "Crie sua conta gratuitamente em poucos minutos. Preencha seus dados e perfil de produtor para começar a anunciar." },
              { icon: PlusSquare, step: "2", title: "Publique", description: "Adicione seus serviços e equipamentos disponíveis. Defina preço, disponibilidade, localização e uma boa descrição para atrair clientes." },
              { icon: Users, step: "3", title: "Receba clientes", description: "Produtores da sua região encontram seu anúncio ao buscar o que você oferece. Mais visibilidade, mais negócios." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center gap-4 p-6 bg-card rounded-xl border border-border shadow-sm">
                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-xl shrink-0">{item.step}</div>
                <item.icon className="h-8 w-8 text-primary" />
                <h3 className="font-heading font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/cadastro"><Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8">Criar minha conta</Button></Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-heading font-bold text-center mb-10">Dúvidas frequentes</h2>
          <div className="space-y-6">
            {[
              { q: "É gratuito para anunciar?", a: "O cadastro e a publicação de anúncios é gratuita. O contratante paga apenas para liberar o contato do fornecedor." },
              { q: "Como funciona o pagamento?", a: "O pagamento pelo aluguel ou serviço é combinado diretamente entre contratante e fornecedor. A AgroAluga facilita a conexão." },
              { q: "Posso anunciar em mais de uma região?", a: "Sim! Ao criar seu anúncio você define a região de atendimento, podendo incluir cidades e estados diferentes." },
              { q: "Como sei se o fornecedor é confiável?", a: "Cada anúncio exibe avaliações de outros produtores que já contrataram o serviço. Sempre verifique a reputação antes de fechar." },
            ].map((item) => (
              <div key={item.q} className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-heading font-semibold mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
