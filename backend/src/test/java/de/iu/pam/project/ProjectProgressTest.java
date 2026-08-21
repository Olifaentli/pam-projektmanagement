package de.iu.pam.project;

import static org.assertj.core.api.Assertions.assertThat;

import de.iu.pam.project.dto.ProjectProgressResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/**
 * Fortschrittsberechnung (US-6).
 *
 * <p>Reiner Unit-Test ohne Spring-Kontext: die Rechenregel haengt an keiner
 * Infrastruktur und laesst sich daher isoliert und in Millisekunden pruefen.</p>
 */
class ProjectProgressTest {

    @Test
    @DisplayName("Ein Projekt ohne Aufgaben steht bei 0 Prozent, nicht bei 100")
    void emptyProjectIsZeroPercent() {
        ProjectProgressResponse progress = ProjectProgressResponse.of(0, 0, 0, 0);

        assertThat(progress.percentDone()).isZero();
        assertThat(progress.total()).isZero();
    }

    @Test
    @DisplayName("Alle Aufgaben erledigt ergibt 100 Prozent")
    void allDoneIsHundredPercent() {
        assertThat(ProjectProgressResponse.of(4, 0, 0, 4).percentDone()).isEqualTo(100);
    }

    @ParameterizedTest(name = "{0} Aufgaben, davon {1} erledigt -> {2} Prozent")
    @CsvSource({
            "7, 3, 43",   // kaufmaennisch gerundet: 42,857 -> 43
            "3, 1, 33",
            "3, 2, 67",
            "8, 2, 25",
            "100, 1, 1",
    })
    @DisplayName("Der Prozentwert wird kaufmännisch gerundet")
    void roundsHalfUp(long total, long done, int expected) {
        assertThat(ProjectProgressResponse.of(total, total - done, 0, done).percentDone())
                .isEqualTo(expected);
    }

    @Test
    @DisplayName("Die Einzelzähler bleiben unverändert erhalten")
    void keepsRawCounts() {
        ProjectProgressResponse progress = ProjectProgressResponse.of(10, 5, 3, 2);

        assertThat(progress.open()).isEqualTo(5);
        assertThat(progress.inProgress()).isEqualTo(3);
        assertThat(progress.done()).isEqualTo(2);
        assertThat(progress.percentDone()).isEqualTo(20);
    }
}
