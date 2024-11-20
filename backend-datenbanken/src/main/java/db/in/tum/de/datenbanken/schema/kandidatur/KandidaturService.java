package db.in.tum.de.datenbanken.schema.kandidatur;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class KandidaturService {

    private final KandidaturRepository kandidaturRepository;

    public Kandidatur saveKandidatur(Kandidatur kandidatur) {
        return kandidaturRepository.save(kandidatur);
    }

    public Kandidatur updateKandidatur(Kandidatur kandidatur) {
        return kandidaturRepository.save(kandidatur);
    }

    public List<Kandidatur> saveAllKandidatur(List<Kandidatur> kandidaturList) {
        return kandidaturRepository.saveAll(kandidaturList);
    }

    public Kandidatur getKandidatur(Long id) {
        return kandidaturRepository.findById(id).orElse(null);
    }

    public void deleteKandidatur(Long id) {
        kandidaturRepository.deleteById(id);
    }
}
