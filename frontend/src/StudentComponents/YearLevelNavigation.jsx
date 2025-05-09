import { useState } from "react"
import { Card, Nav } from "react-bootstrap"
import { Calendar } from "react-bootstrap-icons"

const YearLevelNavigation = ({ yearLevels }) => {
  const [activeYearLevel, setActiveYearLevel] = useState(yearLevels[0] || "")

  return (
    <Card className="mb-4 border-0">
      <Card.Header className="bg-white border-0">
        <Nav variant="tabs" className="year-level-tabs">
          {yearLevels.map((yearLevel) => (
            <Nav.Item key={yearLevel}>
              <Nav.Link
                active={activeYearLevel === yearLevel}
                onClick={() => setActiveYearLevel(yearLevel)}
                className="d-flex align-items-center"
              >
                <Calendar size={16} className="me-2" />
                {yearLevel}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </Card.Header>
    </Card>
  )
}

export default YearLevelNavigation

