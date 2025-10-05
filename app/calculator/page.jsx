"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CableIcon as CalcIcon, Activity, Target } from "lucide-react"

export default function CalculatorPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeCalc, setActiveCalc] = useState("bmi")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Fitness Calculators</h1>
          <p className="text-xl text-muted-foreground">Calculate your BMI, daily calorie needs, and one-rep max</p>
        </div>

        {/* Calculator Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <Button
            variant={activeCalc === "bmi" ? "default" : "outline"}
            onClick={() => setActiveCalc("bmi")}
            className="flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            BMI Calculator
          </Button>
          <Button
            variant={activeCalc === "calories" ? "default" : "outline"}
            onClick={() => setActiveCalc("calories")}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Calorie Calculator
          </Button>
          <Button
            variant={activeCalc === "onerepmax" ? "default" : "outline"}
            onClick={() => setActiveCalc("onerepmax")}
            className="flex items-center gap-2"
          >
            <CalcIcon className="w-4 h-4" />
            One Rep Max
          </Button>
        </div>

        {/* Calculator Content */}
        <div className="max-w-2xl">
          {activeCalc === "bmi" && <BMICalculator />}
          {activeCalc === "calories" && <CalorieCalculator />}
          {activeCalc === "onerepmax" && <OneRepMaxCalculator />}
        </div>
      </main>
    </div>
  )
}

function BMICalculator() {
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [unit, setUnit] = useState("metric")
  const [result, setResult] = useState(null)

  const calculateBMI = () => {
    let bmi
    if (unit === "metric") {
      const heightInMeters = Number.parseFloat(height) / 100
      bmi = Number.parseFloat(weight) / (heightInMeters * heightInMeters)
    } else {
      bmi = (Number.parseFloat(weight) / (Number.parseFloat(height) * Number.parseFloat(height))) * 703
    }

    let category = ""
    if (bmi < 18.5) category = "Underweight"
    else if (bmi < 25) category = "Normal weight"
    else if (bmi < 30) category = "Overweight"
    else category = "Obese"

    setResult({ bmi: bmi.toFixed(1), category })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">BMI Calculator</h2>

        <div className="space-y-4">
          <div>
            <Label>Unit System</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                <SelectItem value="imperial">Imperial (lbs, inches)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Weight ({unit === "metric" ? "kg" : "lbs"})</Label>
            <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
          </div>

          <div>
            <Label>Height ({unit === "metric" ? "cm" : "inches"})</Label>
            <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
          </div>

          <Button onClick={calculateBMI} className="w-full" disabled={!weight || !height}>
            Calculate BMI
          </Button>

          {result && (
            <div className="mt-6 p-6 bg-primary/10 rounded-lg text-center">
              <div className="text-4xl font-bold text-primary mb-2">{result.bmi}</div>
              <div className="text-xl font-semibold">{result.category}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CalorieCalculator() {
  const [age, setAge] = useState("")
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [gender, setGender] = useState("male")
  const [activity, setActivity] = useState("moderate")
  const [result, setResult] = useState(null)

  const calculateCalories = () => {
    let bmr
    if (gender === "male") {
      bmr = 10 * Number.parseFloat(weight) + 6.25 * Number.parseFloat(height) - 5 * Number.parseFloat(age) + 5
    } else {
      bmr = 10 * Number.parseFloat(weight) + 6.25 * Number.parseFloat(height) - 5 * Number.parseFloat(age) - 161
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    }

    const tdee = bmr * activityMultipliers[activity]
    setResult({
      maintenance: Math.round(tdee),
      cutting: Math.round(tdee - 500),
      bulking: Math.round(tdee + 500),
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Daily Calorie Calculator</h2>

        <div className="space-y-4">
          <div>
            <Label>Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Age (years)</Label>
            <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" />
          </div>

          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
          </div>

          <div>
            <Label>Height (cm)</Label>
            <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
          </div>

          <div>
            <Label>Activity Level</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                <SelectItem value="veryActive">Very Active (intense exercise daily)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={calculateCalories} className="w-full" disabled={!age || !weight || !height}>
            Calculate Calories
          </Button>

          {result && (
            <div className="mt-6 space-y-3">
              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Maintenance</div>
                <div className="text-2xl font-bold">{result.maintenance} cal/day</div>
              </div>
              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Weight Loss</div>
                <div className="text-2xl font-bold text-primary">{result.cutting} cal/day</div>
              </div>
              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Muscle Gain</div>
                <div className="text-2xl font-bold text-primary">{result.bulking} cal/day</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function OneRepMaxCalculator() {
  const [weight, setWeight] = useState("")
  const [reps, setReps] = useState("")
  const [result, setResult] = useState(null)

  const calculateOneRepMax = () => {
    const w = Number.parseFloat(weight)
    const r = Number.parseFloat(reps)

    // Epley formula
    const oneRepMax = w * (1 + r / 30)

    const percentages = {
      "95%": Math.round(oneRepMax * 0.95),
      "90%": Math.round(oneRepMax * 0.9),
      "85%": Math.round(oneRepMax * 0.85),
      "80%": Math.round(oneRepMax * 0.8),
      "75%": Math.round(oneRepMax * 0.75),
    }

    setResult({ oneRepMax: Math.round(oneRepMax), percentages })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">One Rep Max Calculator</h2>

        <div className="space-y-4">
          <div>
            <Label>Weight Lifted (kg or lbs)</Label>
            <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="100" />
          </div>

          <div>
            <Label>Repetitions</Label>
            <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="5" />
          </div>

          <Button onClick={calculateOneRepMax} className="w-full" disabled={!weight || !reps}>
            Calculate 1RM
          </Button>

          {result && (
            <div className="mt-6">
              <div className="p-6 bg-primary/10 rounded-lg text-center mb-4">
                <div className="text-sm text-muted-foreground mb-1">Estimated One Rep Max</div>
                <div className="text-4xl font-bold text-primary">{result.oneRepMax}</div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold mb-3">Training Percentages</h3>
                {Object.entries(result.percentages).map(([percent, value]) => (
                  <div key={percent} className="flex justify-between p-3 bg-card border border-border rounded-lg">
                    <span className="text-muted-foreground">{percent}</span>
                    <span className="font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
