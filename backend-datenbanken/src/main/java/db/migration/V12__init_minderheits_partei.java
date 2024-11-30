package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

public class V12__init_minderheits_partei extends BaseJavaMigration {
    @Override
    public void migrate(Context context) throws Exception {
        context.getConnection().createStatement().execute("INSERT INTO " +
                "minderheitspartei (id, partei_id) " +
                "VALUES (1, (select id from partei where kurzbezeichnung = 'SSW'))");
    }
}

