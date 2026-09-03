num = input()
hours = num // 3600
num = num - hours * 3600
min = num // 60
num = num - min * 60
sec = num 
print(hours, min , sec)