export default function PrivacidadePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-heading font-bold mb-2">Politica de Privacidade</h1>
      <p className="text-sm text-muted-foreground mb-8">Última atualização: abril de 2026</p>

      <div className="space-y-8 text-foreground">

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">1. Dados que Coletamos</h2>
          <p className="text-muted-foreground leading-relaxed">Ao usar o AgroAluga, coletamos:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
            <li>Nome, e-mail, telefone e localização fornecidos no cadastro</li>
            <li>Fotos de perfil e imagens de anúncios enviadas voluntariamente</li>
            <li>Mensagens trocadas pelo chat da plataforma</li>
            <li>Dados de uso como páginas visitadas e anúncios visualizados</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">2. Como Usamos seus Dados</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Operação e melhoria da plataforma</li>
            <li>Comunicação sobre sua conta e anúncios</li>
            <li>Envio de notificações transacionais (aprovação de anúncio, novas mensagens)</li>
            <li>Cumprimento de obrigações legais</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">3. Compartilhamento de Dados</h2>
          <p className="text-muted-foreground leading-relaxed">
            Seus dados não são vendidos a terceiros. Compartilhamos apenas com prestadores de serviço
            essenciais para operação da plataforma (infraestrutura de banco de dados e serviço de e-mail),
            todos com políticas de privacidade próprias e em conformidade com a LGPD.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">4. Seus Direitos (LGPD)</h2>
          <p className="text-muted-foreground leading-relaxed">Voce tem direito a:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
            <li>Acessar os dados que temos sobre você</li>
            <li>Corrigir dados incorretos ou desatualizados</li>
            <li>Solicitar a exclusão da sua conta e dados associados</li>
            <li>Revogar consentimento para uso dos seus dados</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Para exercer esses direitos, entre em contato pelo e-mail
            <a href="mailto:agroaluga@outlook.com" className="text-primary hover:underline ml-1">agroaluga@outlook.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">5. Seguranca</h2>
          <p className="text-muted-foreground leading-relaxed">
            Utilizamos criptografia, autenticação segura e boas práticas de segurança para proteger seus dados.
            Nenhum sistema e 100% seguro, mas nos comprometemos a notificar os usuários em caso de incidentes
            que possam afetar seus dados pessoais.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">6. Contato</h2>
          <p className="text-muted-foreground leading-relaxed">
            Dúvidas sobre privacidade:
            <a href="mailto:agroaluga@outlook.com" className="text-primary hover:underline ml-1">
              agroaluga@outlook.com
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
