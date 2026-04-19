export default function TermosPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-heading font-bold mb-2">Termos de Uso</h1>
      <p className="text-sm text-muted-foreground mb-8">Ultima atualizacao: abril de 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">1. Sobre a Plataforma</h2>
          <p className="text-muted-foreground leading-relaxed">
            O AgroAluga e uma plataforma de conexao entre produtores rurais que oferecem equipamentos e servicos agricolas
            e produtores que buscam essas solucoes na sua regiao. A plataforma e operada por pessoa fisica, com sede
            em Santa Catarina, Brasil, e pode ser acessada pelo endereco <strong>agro-aluga.vercel.app</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">2. Aceitacao dos Termos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Ao se cadastrar ou utilizar o AgroAluga, voce declara ter lido, compreendido e concordado com estes
            Termos de Uso. Caso nao concorde com qualquer disposicao, nao utilize a plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">3. Cadastro e Conta</h2>
          <p className="text-muted-foreground leading-relaxed">
            Para utilizar os recursos completos da plataforma, e necessario criar uma conta com informacoes verdadeiras
            e atualizadas. Voce e responsavel pela confidencialidade da sua senha e por todas as atividades realizadas
            com sua conta. O AgroAluga reserva-se o direito de encerrar contas que violem estes termos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">4. Publicacao de Anuncios</h2>
          <p className="text-muted-foreground leading-relaxed">
            Ao publicar um anuncio, o usuario declara que:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
            <li>E proprietario ou tem autorizacao para anunciar o equipamento ou servico</li>
            <li>As informacoes, fotos e precos sao verdadeiros e atualizados</li>
            <li>O conteudo nao viola direitos de terceiros nem a legislacao brasileira</li>
            <li>Nao serao publicados conteudos ofensivos, enganosos, ilegais ou inadequados</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Todos os anuncios passam por moderacao antes de serem publicados. O AgroAluga reserva-se o direito
            de recusar ou remover anuncios que violem estas diretrizes, sem necessidade de justificativa previa.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">5. Responsabilidade pelas Negociacoes</h2>
          <p className="text-muted-foreground leading-relaxed">
            O AgroAluga e uma plataforma de conexao e nao participa das negociacoes, contratos ou transacoes
            realizadas entre usuarios. A plataforma nao se responsabiliza por:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
            <li>Qualidade, estado ou disponibilidade dos equipamentos e servicos anunciados</li>
            <li>Descumprimento de acordos entre as partes</li>
            <li>Danos causados durante a prestacao de servicos ou uso de equipamentos</li>
            <li>Veracidade das informacoes fornecidas pelos usuarios</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Recomendamos que todos os acordos sejam formalizados por escrito entre as partes antes da prestacao
            do servico ou entrega do equipamento.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">6. Avaliacoes</h2>
          <p className="text-muted-foreground leading-relaxed">
            Os usuarios que revelarem o contato de um anunciante podem deixar avaliacoes sobre sua experiencia.
            As avaliacoes devem ser honestas e baseadas em experiencias reais. E proibido publicar avaliacoes
            falsas, difamatorias ou com o objetivo de prejudicar concorrentes. Avaliacoes que violem estas
            diretrizes podem ser removidas pelo AgroAluga.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">7. Gratuidade e Alteracoes no Modelo</h2>
          <p className="text-muted-foreground leading-relaxed">
            O cadastro e a publicacao de anuncios sao atualmente gratuitos. O AgroAluga reserva-se o direito
            de alterar o modelo de negocios e introduzir planos pagos no futuro, mediante comunicacao previa
            aos usuarios com antecedencia minima de 30 dias.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">8. Propriedade Intelectual</h2>
          <p className="text-muted-foreground leading-relaxed">
            Todo o conteudo da plataforma — marca, design, textos e funcionalidades — e de propriedade do
            AgroAluga. Ao publicar fotos e textos na plataforma, o usuario concede ao AgroAluga licenca nao
            exclusiva para exibir esse conteudo dentro da plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">9. Privacidade e Dados</h2>
          <p className="text-muted-foreground leading-relaxed">
            O tratamento de dados pessoais e regido pela nossa Politica de Privacidade, em conformidade com
            a Lei Geral de Protecao de Dados (LGPD — Lei 13.709/2018). Os dados coletados sao utilizados
            exclusivamente para operacao da plataforma e nao sao vendidos a terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">10. Contato</h2>
          <p className="text-muted-foreground leading-relaxed">
            Para duvidas, sugestoes ou reclamacoes relacionadas a estes termos, entre em contato pelo e-mail:
            <a href="mailto:agroaluga@outlook.com" className="text-primary hover:underline ml-1">
              agroaluga@outlook.com
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
