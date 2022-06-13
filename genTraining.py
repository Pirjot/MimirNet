'''
This Python File generates Training Data that can be used
on the MimirNet GUI.

'''


from random import Random


def grades(amount = 1000):
    data = []
    rand = Random()

    gradeDistribution = {
        "tests": .4,
        "homework": .2,
        "quizzes": .1,
        "projects": .3
    }

    for i in range(amount):
        # Generate a Grade Distribution
        grades = []
        
        for val in gradeDistribution.values():
            grades.append(round(rand.random() / 1.7 + (1 - 1 / 1.7), 2)) # Between the range .5 and 1
        letterGrade = [0, 0, 0, 0, 0]
        # Calculate Class Grade
        classGrade = 0
        for i in range(len(grades)):
            classGrade += list(gradeDistribution.values())[i] * grades[i]
        
        # Classify Class Grade
        if (classGrade >= .9):
            letterGrade[0] = 1
        elif (classGrade >= .8):
            letterGrade[1] = 1
        elif (classGrade >= .7):
            letterGrade[2] = 1
        elif (classGrade >= .6):
            letterGrade[3] = 1
        else:
            letterGrade[4] = 1
        data.append([grades, letterGrade])
    return data


def normalizeGrades(data):
    mean = 0
    count = 0
    minValue = None
    maxValue = None
    for point in data:
        grades = point[0]
        for grade in grades:
            if (not minValue or grade < minValue):
                minValue = grade
            if (not maxValue or grade > maxValue):
                maxValue = grade
            mean += grade
            count += 1
    ran = maxValue - minValue
    mean = mean / count

    for i in range(len(data)):
        for j in range(len(data[i][0])):
            data[i][0][j] = round((data[i][0][j] - mean) / ran, 2)
    return data

        

def main():
    # Generate Grades Data
    data = normalizeGrades(grades())
    for val in data:
        print(val, sep="", end=",\n")




main()