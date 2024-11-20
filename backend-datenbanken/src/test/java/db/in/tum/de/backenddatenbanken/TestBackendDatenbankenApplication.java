package db.in.tum.de.backenddatenbanken;

import db.in.tum.de.datenbanken.BackendDatenbankenApplication;
import org.springframework.boot.SpringApplication;

public class TestBackendDatenbankenApplication {

    public static void main(String[] args) {
        SpringApplication.from(BackendDatenbankenApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
