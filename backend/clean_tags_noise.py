import json
import logging
from sqlmodel import Session, select
from database import engine, Card

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("migration")

def main():
    logger.info("Iniciando migração para limpeza do ruído 'Tags:'...")
    
    updated_count = 0
    total_count = 0
    
    with Session(engine) as session:
        # Busca todos os cards cadastrados no banco
        statement = select(Card)
        cards = session.exec(statement).all()
        total_count = len(cards)
        
        for card in cards:
            try:
                # O campo tags armazena uma string contendo o array JSON de tags
                tags_list = json.loads(card.tags) if card.tags else []
                
                # Se "Tags:" estiver presente, removemos da lista
                if "Tags:" in tags_list:
                    # Filtra removendo a tag indesejada
                    cleaned_tags = [tag for tag in tags_list if tag != "Tags:"]
                    
                    # Atualiza o modelo
                    card.tags = json.dumps(cleaned_tags)
                    session.add(card)
                    updated_count += 1
            except Exception as e:
                logger.error(f"Erro ao processar card ID={card.id} (seq={card.seq}): {e}")
        
        # Confirma as alterações no banco de dados de forma transacional
        if updated_count > 0:
            session.commit()
            logger.info(f"Sucesso! {updated_count} de {total_count} cards foram atualizados e salvos.")
        else:
            logger.info("Nenhum card com a tag de ruído 'Tags:' foi encontrado para atualização.")

if __name__ == "__main__":
    main()
