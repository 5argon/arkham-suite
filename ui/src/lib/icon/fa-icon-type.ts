/**
 * Font Awesome icon types used in the application.
 * Each enum value corresponds to a specific SVG file.
 */
export enum FaIconType {
	Customizable,
	Bonded,
	Exceptional,
	Permanent,
	Investigator,
	Weakness,
	AnyWeakness,
	Myriad,
	Specialist,
	Advanced,
	Reward,
	Researched,
	Fast,
	Starting,

	Ultimatum,
	Boon,

	EncounterSubset,
	Dropdown,
	LeftSingle,
	LeftDouble,
	RightSingle,
	RightDouble,
	ArrowUp,
	ArrowUpAdd,
	ArrowDown,
	ArrowDownAdd,
	/** Swap / exchange two things (e.g. swap the two widgets of a split row). */
	Swap,
	Import,
	Export,
	Add,
	Edit,
	Back,
	ArrowLeftBordered,
	ArrowRightBordered,
	Delete,
	DeleteList,
	Unlock,
	Collapse,
	InvestigatorRestriction,
	NoticeInfo,
	NoticeSuccess,
	NoticeError,
	Loading,
	Manual,
	Plus,
	Minus,
	Grip,
	SectionSeparator,
	SetupReferenceNotes,
	SetupReferenceAdditionalCards,
	SetupReferenceSetupChanges,
	SetupReferenceExplorationDeck,
	SetupReferenceSpectralDeck,
	SetupReferenceConcealedMiniCards,

	UpgradePlannerUpgradeTo,
	UpgradePlannerAdd,
	UpgradePlannerXpUnlock,
	UpgradePlannerXpLock,

	CardViewModeScans,
	CardViewModeList,
	CardViewModeIcons,
	GroupingSorting,

	CheckBox,
	CheckBoxChecked,
	Expand,
	Experience,
	FoldoutRight,
	FoldoutDown,
	Reset,
	Clear,
	CloseModal,
	ExternalLink,
	Logout,

	// Widget picker status
	/** Widget depends on data from the "Extra" archive tab — user may want to skip or fill in data first. */
	WidgetRequiresExtra,

	/** A log entry contributed by a standalone scenario played inside the campaign. */
	StandaloneSource,

	// Achievements
	/** An earnable achievement (the marker/bullet). */
	Achievement,
	/** Achievement that must be ticked by hand (no campaign-log trace). */
	AchievementManual,
	/** Achievement auto-derived from the recorded campaign log. */
	AchievementInferred,
	/** Achievement auto-derived, but only with the per-scenario "Extra" inputs (not the log alone). */
	AchievementInferredExtra,

	// World map (TSK solver map tool)
	Map,

	// Campaign endings (shared by the Overview + Endings widgets)
	/** A win ending. */
	EndingWin,
	/** A superior / "better" win ending. */
	EndingBetterWin,
	/** A losing ending. */
	EndingLoss,
	/** A special / rival-faction ("other kind of") ending. */
	EndingSpecial,
}
