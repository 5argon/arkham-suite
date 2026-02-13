create table deck_boxes
(
    id                uuid                     default gen_random_uuid() not null primary key,
    created_at        timestamp with time zone default now()             not null,
    deck_id           uuid                                               not null references decks on delete cascade,
    type              deck_box_type                                      not null,
    reference_card_id text references cards
);

comment on table deck_boxes is 'Virtual "box" of cards. Each deck can have several storage, such as main deck, side deck, or extra deck.';

comment on column deck_boxes.reference_card_id is 'For attachment boxes, can target a card the box is attached to.';

alter table deck_boxes
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on deck_boxes to anon;

grant delete, insert, references, select, trigger, truncate, update on deck_boxes to authenticated;

grant delete, insert, references, select, trigger, truncate, update on deck_boxes to service_role;

