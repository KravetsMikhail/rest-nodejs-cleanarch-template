package model

// ComponentConfig describes input parameters for component generation.
type ComponentConfig struct {
	SingularName  string
	PluralName    string
	ApiVersion    string
	MigrationFile string
	TableFields   []TableField
}

// TableField describes a single table column parsed from migration.
type TableField struct {
	Name     string
	Type     string
	Nullable bool
	Default  string
}

