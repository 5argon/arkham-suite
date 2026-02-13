-- Foreign key constraints for cards table

-- Add foreign key constraints to cards table
alter table cards
    add constraint fk_cards_pack foreign key (pack_id) references packs (id);

alter table cards
    add constraint fk_cards_type foreign key (type_id) references types (id);

alter table cards
    add constraint fk_cards_subtype foreign key (subtype_id) references subtypes (id);

alter table cards
    add constraint fk_cards_faction foreign key (faction_id) references factions (id);

alter table cards
    add constraint fk_cards_faction2 foreign key (faction2_id) references factions (id);

alter table cards
    add constraint fk_cards_faction3 foreign key (faction3_id) references factions (id);

alter table cards
    add constraint fk_cards_encounter foreign key (encounter_id) references encounters (id);

alter table cards
    add constraint fk_cards_linked foreign key (linked_id) references cards (id);

alter table cards
    add constraint fk_cards_duplicate foreign key (duplicate_id) references cards (id);

alter table cards
    add constraint fk_cards_alternate foreign key (alternate_id) references cards (id);

-- Add foreign key constraint to reviews table
alter table reviews
    add constraint fk_reviews_card foreign key (card_id) references cards (id);

alter table reviews
    add constraint fk_reviews_user foreign key (user_id) references auth.users (id);
