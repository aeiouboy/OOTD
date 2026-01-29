#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = [
#   "pydantic",
#   "python-dotenv",
#   "click",
#   "rich",
# ]
# ///
"""
Execute E2E tests using Playwright MCP through Claude Code.

This ADW orchestrates end-to-end testing workflows by:
1. Executing the /e2e slash command with test scenarios
2. Using Playwright MCP tools for browser automation
3. Generating comprehensive test reports
4. Optionally creating persistent test files

Usage:
    # Basic E2E test
    ./adws/adw_e2e_test.py "Test executive dashboard loads and displays metrics"

    # Test with custom URL
    ./adws/adw_e2e_test.py "Test order search functionality" --url http://localhost:3000/orders

    # Test with specific model
    ./adws/adw_e2e_test.py "Test mobile responsive navigation" --model opus

    # Create persistent test file
    ./adws/adw_e2e_test.py "Test order creation flow" --create-spec

Examples:
    # Test navigation
    ./adws/adw_e2e_test.py "Navigate to style guide page and verify all tabs are visible"

    # Test form interaction
    ./adws/adw_e2e_test.py "Fill out order form and submit" --url http://localhost:3000/orders/new

    # Test responsive design
    ./adws/adw_e2e_test.py "Test mobile menu on executive dashboard" --create-spec

    # Test with detailed reporting
    ./adws/adw_e2e_test.py "Comprehensive order management hub test" --model opus --create-spec
"""

import os
import sys
import json
from pathlib import Path
import click
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from datetime import datetime

# Add the adw_modules directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "adw_modules"))

from agent import (
    AgentTemplateRequest,
    AgentPromptResponse,
    execute_template,
    generate_short_id,
)

# Output file constants
OUTPUT_JSONL = "cc_raw_output.jsonl"
OUTPUT_JSON = "cc_raw_output.json"
FINAL_OBJECT_JSON = "cc_final_object.json"
SUMMARY_JSON = "custom_summary_output.json"


@click.command()
@click.argument("test_scenario", required=True)
@click.option(
    "--url",
    default="http://localhost:3000",
    help="Target page URL (default: http://localhost:3000)",
)
@click.option(
    "--model",
    type=click.Choice(["sonnet", "opus"]),
    default="sonnet",
    help="Claude model to use (default: sonnet)",
)
@click.option(
    "--working-dir",
    type=click.Path(exists=True, file_okay=False, dir_okay=True, resolve_path=True),
    help="Working directory (default: current directory)",
)
@click.option(
    "--create-spec",
    is_flag=True,
    help="Create a persistent Playwright test spec file",
)
@click.option(
    "--output-dir",
    type=click.Path(file_okay=False, dir_okay=True),
    help="Custom output directory for test artifacts",
)
def main(
    test_scenario: str,
    url: str,
    model: str,
    working_dir: str,
    create_spec: bool,
    output_dir: str,
):
    """
    Execute E2E tests using Playwright MCP through Claude Code.

    The test scenario should describe what to test, for example:
    - "Test that the executive dashboard loads successfully"
    - "Test order search with filters"
    - "Test mobile responsive navigation menu"
    """
    console = Console()

    # Generate unique ID for this test execution
    adw_id = generate_short_id()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Use current directory if not specified
    if not working_dir:
        working_dir = os.getcwd()

    # Build the slash command arguments
    # Format: /e2e <adw_id> <test_scenario> <url>
    args = [adw_id, test_scenario, url]

    # Add create-spec flag if requested
    if create_spec:
        args.append("--create-spec")

    # Create the template request
    request = AgentTemplateRequest(
        agent_name="e2e_tester",
        slash_command="/e2e",
        args=args,
        adw_id=adw_id,
        model=model,
        working_dir=working_dir,
    )

    # Display execution info
    info_table = Table(show_header=False, box=None, padding=(0, 1))
    info_table.add_column(style="bold cyan")
    info_table.add_column()

    info_table.add_row("ADW ID", adw_id)
    info_table.add_row("Workflow", "adw_e2e_test")
    info_table.add_row("Test Scenario", test_scenario)
    info_table.add_row("Target URL", url)
    info_table.add_row("Model", model)
    info_table.add_row("Working Dir", working_dir)
    info_table.add_row("Create Spec", "Yes" if create_spec else "No")
    info_table.add_row("Timestamp", timestamp)

    console.print(
        Panel(
            info_table,
            title="[bold blue]🎭 E2E Test Execution[/bold blue]",
            border_style="blue",
        )
    )
    console.print()

    try:
        # Execute the E2E test
        console.print(
            Panel(
                f"Starting E2E test execution...\nScenario: {test_scenario}",
                title="[bold yellow]🚀 Starting E2E Test[/bold yellow]",
                border_style="yellow",
            )
        )
        console.print()

        with console.status("[bold yellow]Running E2E test with Playwright MCP...[/bold yellow]"):
            response = execute_template(request)

        # Display results
        if response.success:
            console.print(
                Panel(
                    "E2E test completed successfully!\n\n" + response.output,
                    title="[bold green]✅ Test Passed[/bold green]",
                    border_style="green",
                    padding=(1, 2),
                )
            )

            if response.session_id:
                console.print(
                    f"\n[bold cyan]Session ID:[/bold cyan] {response.session_id}\n"
                )
        else:
            console.print(
                Panel(
                    "E2E test failed!\n\n" + response.output,
                    title="[bold red]❌ Test Failed[/bold red]",
                    border_style="red",
                    padding=(1, 2),
                )
            )

            if response.retry_code != "none":
                console.print(
                    f"\n[bold yellow]Retry code:[/bold yellow] {response.retry_code}\n"
                )

        # Generate summary output
        agent_output_dir = f"./agents/{adw_id}/e2e_tester"

        if output_dir:
            # Copy artifacts to custom output directory if specified
            os.makedirs(output_dir, exist_ok=True)
            console.print(f"[dim]Custom output directory: {output_dir}[/dim]\n")

        summary_file = f"{agent_output_dir}/{SUMMARY_JSON}"

        # Create comprehensive summary
        summary_data = {
            "adw_id": adw_id,
            "workflow": "adw_e2e_test",
            "timestamp": timestamp,
            "test_scenario": test_scenario,
            "target_url": url,
            "model": model,
            "working_dir": working_dir,
            "create_spec": create_spec,
            "success": response.success,
            "session_id": response.session_id,
            "retry_code": response.retry_code,
            "output": response.output,
            "slash_command": {
                "command": "/e2e",
                "template_path": ".claude/commands/e2e.md",
                "args": args,
            },
        }

        with open(summary_file, "w") as f:
            json.dump(summary_data, f, indent=2)

        # Display output files
        files_table = Table(show_header=True, box=None)
        files_table.add_column("Artifact", style="bold cyan")
        files_table.add_column("Path", style="dim")
        files_table.add_column("Description", style="italic")

        files_table.add_row(
            "Test Report",
            summary_file,
            "Comprehensive test execution summary",
        )
        files_table.add_row(
            "Raw Output",
            f"{agent_output_dir}/{OUTPUT_JSONL}",
            "Streaming output from Claude Code",
        )
        files_table.add_row(
            "JSON Array",
            f"{agent_output_dir}/{OUTPUT_JSON}",
            "All messages as JSON array",
        )
        files_table.add_row(
            "Final Result",
            f"{agent_output_dir}/{FINAL_OBJECT_JSON}",
            "Final test result object",
        )

        if create_spec:
            files_table.add_row(
                "Test Spec",
                "tests/*.spec.ts",
                "Generated Playwright test file (if created)",
            )

        console.print(
            Panel(
                files_table,
                title="[bold blue]📄 Test Artifacts[/bold blue]",
                border_style="blue",
            )
        )

        # Exit with appropriate code
        sys.exit(0 if response.success else 1)

    except Exception as e:
        console.print(
            Panel(
                f"Unexpected error during E2E test execution:\n{str(e)}",
                title="[bold red]❌ Error[/bold red]",
                border_style="red",
                padding=(1, 2),
            )
        )
        sys.exit(2)


if __name__ == "__main__":
    main()
