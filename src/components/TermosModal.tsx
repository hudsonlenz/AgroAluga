import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TermosModalProps {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export default function TermosModal({ open, onAccept, onClose }: TermosModalProps) {
  const [canAccept, setCanAccept] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setCanAccept(false);
  }, [open]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 40;
    if (isAtBottom) setCanAccept(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Termos de Uso — AgroAluga</DialogTitle>
          <p className="text-sm text-muted-foreground">Role até o fim para aceitar os termos.</p>
        </DialogHeader>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto pr-2 space-y-6 text-sm text-muted-foreground border border-border rounded-md p-4 min-h-0"
          style={{ maxHeight: "50vh" }}
        >
          <section>
            <h3 className="font-semibold text-foreground mb-2">1. Sobre a Plataforma</h3>
            <p>O AgroAluga e uma plataforma de conexao entre produtores rurais que oferecem equipamentos e servicos agricolas e produtores que buscam essas solucoes na sua regiao. A plataforma e operada por pessoa fisica, com sede em Santa Catarina, Brasil.</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">2. Aceitacao dos Termos</h3>
            <p>Ao se cadastrar ou utilizar o AgroAluga, voce declara ter lido, compreendido e concordado com estes Termos de Uso. Caso nao concorde com qualquer disposicao, nao utilize a plataforma.</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">3. Cadastro e Conta</h3>
            <p>Para utilizar os recursos completos da plataforma, e necessario criar uma conta com informacoes verdadeiras e atualizadas. Voce e responsavel pela confidencialidade da sua senha e por todas as atividades realizadas com sua conta. O AgroAluga reserva-se o direito de encerrar contas que violem estes termos.</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">4. Publicacao de Anuncios</h3>
            <p>Ao publicar um anuncio, o usuario declara que e proprietario ou tem autorizacao para anunciar o equipamento ou servico, que as informacoes, fotos e precos sao verdadeiros e atualizados, e que o conteudo nao viola direitos de terceiros nem a legislacao brasileira. Nao serao publicados conteudos ofensivos, enganosos, ilegais ou inadequados. Todos os anuncios passam por moderacao antes de serem publicados.</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">5. Responsabilidade pelas Negociacoes</h3>
            <p>O AgroAluga e uma plataforma de conexao e nao participa das negociacoes, contratos ou transacoes realizadas entre usuarios. A plataforma nao se responsabiliza por qualidade, estado ou disponibilidade dos equipamentos e servicos anunciados, descumprimento de acordos entre as partes, danos causados durante a prestacao de servicos ou uso de equipamentos, ou veracidade das informacoes fornecidas pelos usuarios. Recomendamos que todos os acordos sejam formalizados por escrito entre as partes.</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">6. Avaliacoes</h3>
            <p>Os usuarios que revelarem o contato de um anunciante podem deixar avaliacoes sobre sua experiencia. As avaliacoes devem ser honestas e baseadas em experiencias reais. E proibido publicar avaliacoes falsas, difamatorias ou com o objetivo de prejudicar concorrentes.</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">7. Gratuidade e Alteracoes no Modelo</h3>
            <p>O cadastro e a publicacao de anuncios sao atualmente gratuitos. O AgroAluga reserva-se o direito de alterar o modelo de negocios e introduzir planos pagos no futuro, mediante comunicacao previa aos usuarios com antecedencia minima de 30 dias.</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">8. Propriedade Intelectual</h3>
            <p>Todo o conteudo da plataforma — marca, design, textos e funcionalidades — e de propriedade do AgroAluga. Ao publicar fotos e textos na plataforma, o usuario concede ao AgroAluga licenca nao exclusiva para exibir esse conteudo dentro da plataforma.</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">9. Privacidade e Dados (LGPD)</h3>
            <p>O tratamento de dados pessoais e regido pela nossa Politica de Privacidade, em conformidade com a Lei Geral de Protecao de Dados (LGPD — Lei 13.709/2018). Os dados coletados sao utilizados exclusivamente para operacao da plataforma e nao sao vendidos a terceiros.</p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">10. Contato</h3>
            <p>Para duvidas, sugestoes ou reclamacoes relacionadas a estes termos, entre em contato pelo e-mail: agroaluga@outlook.com</p>
          </section>

          <div className="pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">Ultima atualizacao: abril de 2026</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button
            className={`flex-1 font-semibold transition-all ${canAccept ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
            onClick={canAccept ? onAccept : undefined}
            disabled={!canAccept}
          >
            {canAccept ? "Li e aceito os termos" : "Role até o fim para aceitar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
