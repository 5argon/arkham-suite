create table cards
(
    id                      text                                   not null primary key,
    position                smallint                               not null,
    encounter_position      smallint,
    exceptional             boolean                                not null,
    myriad                  boolean                                not null,
    bonded_to               text references cards,
    bonded_count            smallint,
    cost                    smallint,
    text                    text,
    customization_text      text,
    customization_change    text,
    real_text               text,
    date_creation           timestamp with time zone default now() not null,
    date_update             timestamp with time zone default now() not null,
    errata_date             date,
    quantity                smallint                               not null,
    skill_willpower         smallint,
    skill_intellect         smallint,
    skill_combat            smallint,
    skill_agility           smallint,
    skill_wild              smallint,
    xp                      smallint,
    shroud                  smallint,
    clues                   smallint,
    clues_fixed             boolean,
    doom                    smallint,
    health                  smallint,
    health_per_investigator boolean,
    sanity                  smallint,
    enemy_damage            smallint,
    enemy_horror            smallint,
    enemy_fight             smallint,
    enemy_evade             smallint,
    victory                 smallint,
    vengeance               smallint,
    deck_limit              smallint,
    slot                    varchar(50),
    real_slot               varchar(50),
    stage                   smallint,
    traits                  varchar(255),
    real_traits             varchar(255),
    tags                    varchar(255),
    deck_requirements       varchar(255),
    deck_options            varchar(500),
    customization_options   varchar(1024),
    restrictions            varchar(255),
    flavor                  text,
    illustrator             varchar(255),
    is_unique               boolean                                not null,
    exile                   boolean,
    hidden                  boolean                  default false not null,
    permanent               boolean                  default false not null,
    double_sided            boolean,
    back_text               text,
    back_flavor             text,
    back_name               varchar(1024),
    octgn_id                varchar(255),
    pack_id                 integer,
    type_id                 integer,
    subtype_id              integer,
    faction_id              integer,
    faction2_id             integer,
    faction3_id             integer,
    encounter_id            integer,
    linked_id               integer,
    duplicate_id            integer,
    alternate_id            integer
);

comment on table cards is 'Database of every card in the game.';

-- Add unique constraint on code
create unique index card_code_idx on cards (code);

-- Foreign key constraints will be added after creating all related tables

alter table cards
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on cards to anon;
grant delete, insert, references, select, trigger, truncate, update on cards to authenticated;
grant delete, insert, references, select, trigger, truncate, update on cards to service_role;

