package db.in.tum.de.datenbanken.logic.admin;

import db.in.tum.de.datenbanken.schema.election.Election;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ElectionService electionService;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @GetMapping("/login")
    public String loginPage(@RequestParam(value = "error", required = false) String error,
                            @RequestParam(value = "logout", required = false) String logout,
                            Model model) {
        model.addAttribute("error", error != null);
        model.addAttribute("logout", logout != null);
        return "admin/login";
    }

    /**
     * Displays the Admin Dashboard.
     */
    @SuppressWarnings("OptionalGetWithoutIsPresent")
    @GetMapping("/dashboard")
    public String showDashboard(Model model, @RequestParam(value = "error", required = false) String error) {
        // Check if there's an active election
        boolean electionActive = electionService.isElectionActive();
        model.addAttribute("electionActive", electionActive);

        Election activeElection;
        // If election is active, pass the start time to the Thymeleaf template
        if (electionActive) {
            activeElection = electionService.getActiveElection().get();
            model.addAttribute("electionStartTime", activeElection.getStartTime().format(FORMATTER));
            model.addAttribute("currentElectionYear", activeElection.getYear());
            long totalVoter = electionService.getElectionTotalCount(activeElection.getId());
            long remainingVotes = electionService.getCountOfRemainingVotes(activeElection.getId());
            long votesCount = totalVoter - remainingVotes;
            model.addAttribute("totalVoters", totalVoter);
            model.addAttribute("votesCount", votesCount);
            model.addAttribute("voterTurnout", votesCount / (double) totalVoter);
        } else {
            model.addAttribute("electionStartTime", null);
            model.addAttribute("currentElectionYear", null);
            model.addAttribute("totalVoters", 0);
            model.addAttribute("votesCount", 0);
            model.addAttribute("voterTurnout", 0.0);
        }

        // Add error message if present
        if (error != null) {
            model.addAttribute("errorMessage", error);
        }

        // Return your Thymeleaf template name (dashboard.html)
        return "admin/dashboard";
    }

    @GetMapping("/access-denied")
    public String accessDenied() {
        return "admin/access-denied";
    }

    /**
     * Starts (schedules) a new election.
     * If an election is already active or an election for the same year exists, redirects with an error.
     *
     * @return Redirects to the admin dashboard.
     */
    @PostMapping("/start-election")
    public String startElection(@RequestParam("electionStartTime")
                                    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime electionStartTime,
                                @RequestParam("numberOfVoters") int numberOfVoters,
                                Model model) {
        try {
            electionService.startElection(electionStartTime, numberOfVoters);
        } catch (IllegalStateException e) {
            // Handle business logic exceptions
            return "redirect:/admin/dashboard?error=" + e.getMessage();
        } catch (Exception e) {
            // Handle parsing or other unexpected exceptions
            return "redirect:/admin/dashboard?error=" + e.getMessage();
        }
        return "redirect:/admin/dashboard";
    }

    /**
     * Stops the currently active election.
     *
     * @return Redirects to the admin dashboard.
     */
    @PostMapping("/stop-election")
    public String stopElection() {
        try {
            electionService.stopElection();
        } catch (IllegalStateException e) {
            return "redirect:/admin?error=" + e.getMessage();
        } catch (Exception e) {
            return "redirect:/admin?error=An unexpected error occurred while stopping the election.";
        }
        return "redirect:/admin/dashboard";
    }
}
