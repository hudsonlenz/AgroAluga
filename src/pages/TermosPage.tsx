export default function TermosPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-heading font-bold mb-2">Termos de Uso</h1>
      <p className="text-sm text-muted-foreground mb-8">Última atualização: abril de 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">1. Sobre a Plataforma</h2>
          <p className="text-muted-foreground leading-relaxed">
            O AgroAluga e uma plataforma de conexao entre produtores rurais que oferecem equipamentos e serviços agrícolas
            e produtores que buscam essas soluções na sua região. A plataforma é operada por pessoa física, com sede
            em Santa Catarina, Brasil, e pode ser acessada pelo endereco <strong>agro-aluga.vercel.app</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">2. Aceitação dos Termos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Ao se cadastrar ou utilizar o AgroAluga, você declara ter lido, compreendido e concordado com estes
            Termos de Uso. Caso não concorde com qualquer disposição, não utilize a plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">3. Cadastro e Conta</h2>
          <p className="text-muted-foreground leading-relaxed">
            Para utilizar os recursos completos da plataforma, é necessário criar uma conta com informações verdadeiras
            e atualizadas. Você é responsável pela confidencialidade da sua senha e por todas as atividades realizadas
            com sua conta. O AgroAluga reserva-se o direito de encerrar contas que violem estes termos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">4. Publicação de Anúncios</h2>
          <p className="text-muted-foreground leading-relaxed">
            Ao publicar um anúncio, o usuário declara que:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
            <li>E proprietario ou tem autorização para anunciar o equipamento ou serviço</li>
            <li>As informações, fotos e preços são verdadeiros e atualizados</li>
            <li>O conteúdo não viola direitos de terceiros nem a legislação brasileira</li>
            <li>Não serão publicados conteúdos ofensivos, enganosos, ilegais ou inadequados</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Todos os anúncios passam por moderação antes de serem publicados. O AgroAluga reserva-se o direito
            de recusar ou remover anuncios que violem estas diretrizes, sem necessidade de justificativa previa.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">5. Responsabilidade pelas Negociações</h2>
          <p className="text-muted-foreground leading-relaxed">
            O AgroAluga e uma plataforma de conexão e não participa das negociações, contratos ou transações
            realizadas entre usuários. A plataforma não se responsabiliza por:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
            <li>Qualidade, estado ou disponibilidade dos equipamentos e serviços anunciados</li>
            <li>Descumprimento de acordos entre as partes</li>
            <li>Danos causados durante a prestação de serviços ou uso de equipamentos</li>
            <li>Veracidade das informações fornecidas pelos usuários</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Recomendamos que todos os acordos sejam formalizados por escrito entre as partes antes da prestação
            do servico ou entrega do equipamento.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">6. Avaliações</h2>
          <p className="text-muted-foreground leading-relaxed">
            Os usuários que revelarem o contato de um anunciante podem deixar avaliações sobre sua experiência.
            As avaliações devem ser honestas e baseadas em experiências reais. É proibido publicar avaliações
            falsas, difamatórias ou com o objetivo de prejudicar concorrentes. Avaliações que violem estas
            diretrizes podem ser removidas pelo AgroAluga.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">7. Gratuidade e Alterações no Modelo</h2>
          <p className="text-muted-foreground leading-relaxed">
            O cadastro e a publicação de anúncios são atualmente gratuitos. O AgroAluga reserva-se o direito
            de alterar o modelo de negócios e introduzir planos pagos no futuro, mediante comunicação prévia
            aos usuários com antecedência mínima de 30 dias.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">8. Propriedade Intelectual</h2>
          <p className="text-muted-foreground leading-relaxed">
            Todo o conteúdo da plataforma — marca, design, textos e funcionalidades — e de propriedade do
            AgroAluga. Ao publicar fotos e textos na plataforma, o usuário concede ao AgroAluga licenca nao
            exclusiva para exibir esse conteúdo dentro da plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">9. Privacidade e Dados</h2>
          <p className="text-muted-foreground leading-relaxed">
            O tratamento de dados pessoais e regido pela nossa Política de Privacidade, em conformidade com
            a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018). Os dados coletados sao utilizados
            exclusivamente para operação da plataforma e não são vendidos a terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">10. Contato</h2>
          <p className="text-muted-foreground leading-relaxed">
            Para dúvidas, sugestões ou reclamações relacionadas a estes termos, entre em contato pelo e-mail:
            <a href="mailto:agroaluga@outlook.com" className="text-primary hover:underline ml-1">
              agroaluga@outlook.com
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
