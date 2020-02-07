var selectGUIs = {
    Combat: {
        html: `
        <div>
            <p>Targeting type:</p>
            <select id="combat-targeting">
                <option value="N/A">N/A</option>
                <option value="nearest">Nearest</option>
                <option value="strongest">Strongest</option>
                <option value="weakest">Weakest</option>
                <option value="commandCenter">Command Center</option>
            </select>
        </div>
        `,
        updateFunc: function (player) {
            var targetingType = document.getElementById("combat-targeting").value;
            if (targetingType != "N/A") {
                player.changeProperty("targeting", targetingType, e => { return e.category == "Combat" });
            }
        },
        initFunc: function (player) {
            var targetingSelect = document.getElementById("combat-targeting");
            var targetingType = player.selected[0].targeting;
            var singleTargetingType = true;
            for (var i = 1; player.selected.length > i; i++) {
                var e = player.selected[i];
                if (e.targeting != targetingType) {
                    singleTargetingType = false;
                }
            }
            if (singleTargetingType) {
                console.log(targetingType);
                targetingSelect.value = targetingType;
            }
        }
    }
}