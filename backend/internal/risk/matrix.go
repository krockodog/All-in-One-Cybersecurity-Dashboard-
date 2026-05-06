package risk

type Cell struct {
	Likelihood int `json:"likelihood"`
	Impact     int `json:"impact"`
}

func Score(cell Cell) int {
	return cell.Likelihood * cell.Impact
}

func NISTWeight(function string) float64 {
	switch function {
	case "GV", "ID":
		return 1.0
	case "PR", "DE":
		return 1.2
	case "RS", "RC":
		return 1.4
	default:
		return 1.0
	}
}
